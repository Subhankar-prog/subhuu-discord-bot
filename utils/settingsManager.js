const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'settings.json');

function load() {
  if (!fs.existsSync(SETTINGS_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')); } catch { return {}; }
}

function save(data) {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Get all settings for a specific guild.
 */
function getGuildSettings(guildId) {
  const data = load();
  return data[guildId] || {
    welcomeChannel: null,
    levelChannel: null,
    logChannel: null,
    prefix: '/',
    modules: {
      moderation: false,
      logging: false,
      tickets: false,
      economy: false,
      giveaways: false
    }
  };
}

/**
 * Update settings for a specific guild.
 */
function updateGuildSettings(guildId, newSettings) {
  const data = load();
  const currentSettings = getGuildSettings(guildId);
  
  data[guildId] = { 
    ...currentSettings, 
    ...newSettings,
    modules: {
      ...currentSettings.modules,
      ...(newSettings.modules || {})
    }
  };
  
  save(data);
  return data[guildId];
}

module.exports = {
  getGuildSettings,
  updateGuildSettings
};
