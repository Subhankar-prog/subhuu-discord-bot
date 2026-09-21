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
  if (newSettings.nickname !== undefined) settings.nickname = newSettings.nickname;
  if (newSettings.timezone !== undefined) settings.timezone = newSettings.timezone;
  if (newSettings.managerRoles !== undefined) settings.managerRoles = newSettings.managerRoles;
  
  const mergeObjects = ['modules', 'xpSettings', 'automodSettings', 'welcomeSettings', 'leaveSettings', 'autoRoles', 'economySettings', 'aiSettings', 'ticketSettings'];
  for (const obj of mergeObjects) {
    if (newSettings[obj]) {
      settings[obj] = { ...(settings[obj] || {}), ...newSettings[obj] };
    }
  }

  await settings.save();
  return settings;
}

module.exports = {
  getGuildSettings,
  updateGuildSettings
};
