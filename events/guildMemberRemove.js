// events/guildMemberRemove.js — Leave announcements + Audit Log
const settingsManager = require('../utils/settingsManager');
const { sendLog } = require('../utils/logger');
const { ActionLog } = require('../utils/database');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const settings = await settingsManager.getGuildSettings(member.guild.id);

    // Stats channel update
    if (settings.statsChannelId) {
      const ch = member.guild.channels.cache.get(settings.statsChannelId);
      if (ch) ch.setName(`📊 Members: ${member.guild.memberCount}`).catch(() => {});
    }

    // --- Welcome Leave Message ---
    if (settings.modules?.welcome !== false && settings.welcomeChannel) {
      const ch = member.guild.channels.cache.get(settings.welcomeChannel);
      if (ch) {
        const msg = (settings.welcomeSettings?.leaveMessage || '{username} has left the server.')
          .replace(/{user}/g, member.user.toString())
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, member.guild.name);
        ch.send(`👋 ${msg}`).catch(() => {});
      }
    }

    // --- Announcements: Leave ---
    if (settings.modules?.announcements) {
      const ann = settings.announcementSettings || {};
      if (ann.leaveChannel) {
        const ch = member.guild.channels.cache.get(ann.leaveChannel);
        if (ch) {
          const msg = (ann.leaveMessage || '{username} left the server.')
            .replace(/{user}/g, member.user.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name);
          ch.send(msg).catch(() => {});
        }
      }
    }

    // Audit Logging — Discord embed
    sendLog(member.guild, 'Member Left 🔴', `**User:** ${member.user.tag}\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, '#ef4444', member.user);

    // Audit Logging — DB
    await ActionLog.create({
      guildId: member.guild.id,
      type: 'member_leave',
      title: '🔴 Member Left',
      description: `**${member.user.tag}** left the server`,
      userId: member.user.id,
      username: member.user.tag
    }).catch(() => {});
  }
};
