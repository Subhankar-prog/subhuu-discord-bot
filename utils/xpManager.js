const { User, Guild } = require('./database');

async function ensureUser(guildId, userId, username) {
  let user = await User.findOne({ guildId, userId });
  if (!user) {
    user = new User({ guildId, userId, username: username || 'Unknown' });
    await user.save();
  } else if (username && user.username !== username && username !== 'Unknown') {
    user.username = username;
    await user.save();
  }
  return user;
}

const xpCooldowns = new Map();

async function addMessageXp(guildId, userId, username) {
  const guild = await Guild.findOne({ guildId });
  const settings = guild && guild.xpSettings ? guild.xpSettings : { minXp: 15, maxXp: 25, cooldown: 60 };
  
  const minXp = settings.minXp || 15;
  const maxXp = settings.maxXp || 25;
  const cooldown = (settings.cooldown || 60) * 1000;
  
  const cooldownKey = `${guildId}-${userId}`;
  const now = Date.now();
  
  if (xpCooldowns.has(cooldownKey)) {
    const lastMessage = xpCooldowns.get(cooldownKey);
    if (now - lastMessage < cooldown) return { leveledUp: false };
  }

  xpCooldowns.set(cooldownKey, now);

  const user = await ensureUser(guildId, userId, username);
  
  const xpGained = Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;
  user.xp += xpGained;
  
  const nextLevelXp = calculateRequiredXp(user.level + 1);
  let leveledUp = false;

  while (user.xp >= calculateRequiredXp(user.level + 1)) {
    user.level += 1;
    leveledUp = true;
  }
  
  await user.save();
  return { leveledUp, newLevel: user.level, user };
}

async function addVoiceXp(guildId, userId, minutes) {
  if (minutes < 1) return { leveledUp: false };

  const guild = await Guild.findOne({ guildId });
  const settings = guild && guild.xpSettings ? guild.xpSettings : { voiceMinXp: 5, voiceMaxXp: 15 };
  
  const minXp = settings.voiceMinXp || 5;
  const maxXp = settings.voiceMaxXp || 15;

  const user = await ensureUser(guildId, userId);
  
  let totalXpGained = 0;
  for (let i = 0; i < minutes; i++) {
    totalXpGained += Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;
  }
  
  user.xp += totalXpGained;
  
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
