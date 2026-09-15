const settingsManager = require('./settingsManager');

/**
 * Checks if a specific module is enabled for a guild.
 * @param {string} guildId - The Discord Guild ID
 * @param {string} moduleName - The name of the module (e.g. 'moderation', 'economy')
 * @returns {Promise<boolean>} - True if enabled, false if disabled
 */
async function isModuleEnabled(guildId, moduleName) {
  if (!guildId) return false;
  const settings = await settingsManager.getGuildSettings(guildId);
  if (!settings || !settings.modules) return false;
  
  return !!settings.modules[moduleName];
}

module.exports = {
  isModuleEnabled
};
