const { EmbedBuilder } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    if (!isModuleEnabled(message.guild.id, 'logging')) return;

    const { sendLog } = require('../utils/logger');
    await sendLog(
      message.guild,
      'Message Deleted 🗑️',
      `**Channel:** ${message.channel}\n**Content:**\n${message.content || '*No text content*'}`,
      '#ef4444', // Red
      message.author
    );
  },
};
