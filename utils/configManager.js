const fs = require('fs');
const path = require('path');

const SHOP_PATH = path.join(__dirname, '..', 'data', 'shopItems.json');
const LEVELS_PATH = path.join(__dirname, '..', 'data', 'levelRewards.json');

function loadConfig(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return {}; }
}

function saveConfig(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  getShopItems: (guildId) => {
    const data = loadConfig(SHOP_PATH);
    return data[guildId] || data['default'] || {};
  },
  saveShopItems: (guildId, items) => {
    const data = loadConfig(SHOP_PATH);
    data[guildId] = items;
    saveConfig(SHOP_PATH, data);
  },
  
  getLevelRewards: (guildId) => {
    const data = loadConfig(LEVELS_PATH);
    return data[guildId] || data['default'] || {};
  },
  saveLevelRewards: (guildId, rewards) => {
    const data = loadConfig(LEVELS_PATH);
    data[guildId] = rewards;
    saveConfig(LEVELS_PATH, data);
  }
};
