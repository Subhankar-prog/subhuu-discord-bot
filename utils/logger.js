const { EmbedBuilder } = require('discord.js');
const { isModuleEnabled } = require('./moduleGuard');
const { getGuildSettings } = require('./settingsManager');

/**
 * Sends a log embed to the configured Mod Log channel.
 * @param {import('discord.js').Guild} guild 
 * @param {string} title 
 * @param {string} description 
 * @param {string} hexColor (e.g., '#ff4444' for Red, '#22c55e' for Green)
 * @param {import('discord.js').User} [user] Optional user to show in author block
 * @param {Array<{name: string, value: string, inline?: boolean}>} [fields] Optional fields
 */
async function sendLog(guild, title, description, hexColor, user = null, fields = null) {
  if (!guild) return;
  if (!isModuleEnabled(guild.id, 'logging')) return;

  const settings = getGuildSettings(guild.id);
  if (!settings.logChannel) return;

  const logChannel = guild.channels.cache.get(settings.logChannel);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor(hexColor)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (fields) embed.addFields(fields);

  if (user) {
    embed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
  }

  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { sendLog };
