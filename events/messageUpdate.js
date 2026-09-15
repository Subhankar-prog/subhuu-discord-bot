const { EmbedBuilder } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Only care about text changes

    if (!isModuleEnabled(oldMessage.guild.id, 'logging')) return;

    const { sendLog } = require('../utils/logger');
    await sendLog(
      oldMessage.guild,
      'Message Edited ✏️',
      `**Channel:** ${oldMessage.channel}\n[Jump to Message](${newMessage.url})`,
      '#eab308', // Yellow
      oldMessage.author,
      [
        { name: 'Before', value: oldMessage.content || '*No text content*', inline: false },
        { name: 'After', value: newMessage.content || '*No text content*', inline: false }
      ]
    );
  },
};
