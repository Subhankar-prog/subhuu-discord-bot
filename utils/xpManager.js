const { User } = require('./database');

async function ensureUser(guildId, userId, username) {
  let user = await User.findOne({ guildId, userId });
  if (!user) {
    user = new User({ guildId, userId, username });
    await user.save();
  } else if (username && user.username !== username) {
    user.username = username;
    await user.save();
  }
  return user;
}

const XP_PER_MESSAGE = 15;
const COOLDOWN_MS = 60000;
const xpCooldowns = new Map();

async function addMessageXp(guildId, userId, username) {
  const cooldownKey = `${guildId}-${userId}`;
  const now = Date.now();
  
  if (xpCooldowns.has(cooldownKey)) {
    const lastMessage = xpCooldowns.get(cooldownKey);
    if (now - lastMessage < COOLDOWN_MS) return { leveledUp: false };
  }

  xpCooldowns.set(cooldownKey, now);

  const user = await ensureUser(guildId, userId, username);
  user.xp += XP_PER_MESSAGE;
  
  const nextLevelXp = calculateRequiredXp(user.level + 1);
  let leveledUp = false;

  if (user.xp >= nextLevelXp) {
    user.level += 1;
    leveledUp = true;
  }
  
  await user.save();
  return { leveledUp, newLevel: user.level, user };
}

async function addVoiceXp(guildId, userId, minutes) {
  if (minutes < 1) return { leveledUp: false };

  const user = await ensureUser(guildId, userId);
  const xpGained = minutes * 10;
  user.xp += xpGained;
  
  let leveledUp = false;
  while (user.xp >= calculateRequiredXp(user.level + 1)) {
    user.level += 1;
    leveledUp = true;
  }
  
  await user.save();
  return { leveledUp, newLevel: user.level, user };
}

function calculateRequiredXp(level) {
  return level * level * 100;
}

async function getLeaderboard(guildId, limit = 10) {
  return await User.find({ guildId }).sort({ level: -1, xp: -1 }).limit(limit);
}

async function getRank(guildId, userId) {
  const user = await ensureUser(guildId, userId);
  const higherUsers = await User.countDocuments({
    guildId,
    $or: [
      { level: { $gt: user.level } },
      { level: user.level, xp: { $gt: user.xp } }
    ]
  });
  return higherUsers + 1;
}

module.exports = {
  addMessageXp,
  addVoiceXp,
  calculateRequiredXp,
  getLeaderboard,
  getRank,
  ensureUser
};
