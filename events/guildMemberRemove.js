const settingsManager = require('../utils/settingsManager');
const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const settings = settingsManager.getGuildSettings(member.guild.id);
    if (settings.statsChannelId) {
      const channel = member.guild.channels.cache.get(settings.statsChannelId);
      if (channel) {
        channel.setName(`📊 Members: ${member.guild.memberCount}`).catch(() => {});
      }
    }
    
    // Audit Logging
    sendLog(member.guild, 'Member Left 🔴', `**User:** ${member.user.tag}\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, '#ef4444', member.user);
  },
};
