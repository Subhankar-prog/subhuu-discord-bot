const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'economy.json');

// Ensure file exists
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({}));
}

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

/**
 * Ensures user has an economy profile
 */
function ensureUser(data, guildId, userId) {
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = {
      coins: 0,
      lastDaily: 0
    };
  }
}

function getBalance(guildId, userId) {
  const data = loadData();
  ensureUser(data, guildId, userId);
  return data[guildId][userId].coins;
}

function addCoins(guildId, userId, amount) {
  const data = loadData();
  ensureUser(data, guildId, userId);
  data[guildId][userId].coins += amount;
  saveData(data);
  return data[guildId][userId].coins;
}

function removeCoins(guildId, userId, amount) {
  const data = loadData();
  ensureUser(data, guildId, userId);
  if (data[guildId][userId].coins < amount) return false; // Not enough money
  data[guildId][userId].coins -= amount;
  saveData(data);
  return true;
}

function claimDaily(guildId, userId) {
  const data = loadData();
  ensureUser(data, guildId, userId);
  
  const now = Date.now();
  const lastDaily = data[guildId][userId].lastDaily;
  const cooldown = 24 * 60 * 60 * 1000; // 24 hours

  if (now - lastDaily < cooldown) {
    return { success: false, timeLeft: cooldown - (now - lastDaily) };
  }

  const reward = 500;
  data[guildId][userId].coins += reward;
  data[guildId][userId].lastDaily = now;
  saveData(data);

  return { success: true, reward, newBalance: data[guildId][userId].coins };
}

module.exports = {
  getBalance,
  addCoins,
  removeCoins,
  claimDaily
};
