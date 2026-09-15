const { Guild } = require('./database');

async function getGuildSettings(guildId) {
  let settings = await Guild.findOne({ guildId });
  if (!settings) {
    settings = new Guild({ guildId });
    await settings.save();
  }
  return settings;
}

async function updateGuildSettings(guildId, newSettings) {
  let settings = await Guild.findOne({ guildId });
  if (!settings) {
    settings = new Guild({ guildId });
  }

  if (newSettings.welcomeChannel !== undefined) settings.welcomeChannel = newSettings.welcomeChannel;
  if (newSettings.levelChannel !== undefined) settings.levelChannel = newSettings.levelChannel;
  if (newSettings.logChannel !== undefined) settings.logChannel = newSettings.logChannel;
  if (newSettings.prefix !== undefined) settings.prefix = newSettings.prefix;
  
  if (newSettings.modules) {
    settings.modules = { ...settings.modules, ...newSettings.modules };
  }

  await settings.save();
  return settings;
}

module.exports = {
  getGuildSettings,
  updateGuildSettings
};
