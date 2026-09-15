const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'channelCreate',
  async execute(channel) {
    if (!channel.guild) return;
    
    // Ignore our own temporary Join-To-Create channels to prevent spam
    if (channel.name.includes("'s Lounge")) return;

    sendLog(
      channel.guild,
      'Channel Created 🟢',
      `**Name:** ${channel.name}\n**Type:** ${channel.type === 0 ? 'Text' : channel.type === 2 ? 'Voice' : 'Other'}\n**Mention:** ${channel}`,
      '#22c55e'
    );
  },
};
