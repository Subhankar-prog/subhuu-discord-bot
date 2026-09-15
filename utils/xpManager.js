const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'xp.json');

// ---- I/O ----
function load() {
  if (!fs.existsSync(DATA_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch { return {}; }
}

function save(data) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ---- Level Formula: Level = floor(sqrt(XP / 100)) ----
// Level 0: 0 XP
// Level 1: 100 XP
// Level 2: 400 XP
// Level 3: 900 XP
function getLevelFromXP(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

function getXPForLevel(level) {
  return Math.pow(level, 2) * 100;
}

// ---- Core Logic ----

/**
 * Add XP to a user. Returns { levelUp: boolean, newLevel: number } if they leveled up.
 */
function addXP(guildId, userId, username, amount) {
  const data = load();
  data[guildId] ??= {};
  data[guildId][userId] ??= { xp: 0, level: 0, messages: 0, username };

  const user = data[guildId][userId];
  
  // Keep username updated
  if (username) user.username = username;

  const oldLevel = user.level;
  user.xp += amount;
  user.level = getLevelFromXP(user.xp);

  save(data);

  if (user.level > oldLevel) {
    return { levelUp: true, newLevel: user.level, xp: user.xp };
  }
  return { levelUp: false, newLevel: user.level, xp: user.xp };
}

/**
 * Increment message count for a user.
 */
function addMessage(guildId, userId) {
  const data = load();
  if (!data[guildId]?.[userId]) return;
  data[guildId][userId].messages = (data[guildId][userId].messages || 0) + 1;
  save(data);
}

/**
 * Get a user's full XP profile.
 */
function getProfile(guildId, userId) {
  const data = load();
  const user = data[guildId]?.[userId] || { xp: 0, level: 0, messages: 0 };
  
  const currentLevelXP = getXPForLevel(user.level);
  const nextLevelXP = getXPForLevel(user.level + 1);
  const xpNeeded = nextLevelXP - user.xp;
  
  // Calculate leaderboard rank
  let rank = 0;
  if (data[guildId]) {
    const sorted = Object.entries(data[guildId]).sort((a, b) => b[1].xp - a[1].xp);
    rank = sorted.findIndex(([id]) => id === userId) + 1;
  }

  return {
    ...user,
    currentLevelXP,
    nextLevelXP,
    xpNeeded,
    rank: rank > 0 ? rank : 'Unranked',
  };
}

/**
 * Get the top 10 users in a guild.
 */
function getLeaderboard(guildId) {
  const data = load();
  if (!data[guildId]) return [];
  
  return Object.entries(data[guildId])
    .map(([id, info]) => ({ userId: id, ...info }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
}

module.exports = {
  addXP,
  addMessage,
  getProfile,
  getLeaderboard,
  getLevelFromXP,
  getXPForLevel
};
