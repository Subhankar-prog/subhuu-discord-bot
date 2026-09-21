// events/guildMemberAdd.js — Welcome card, Announcements, Auto Roles, Audit Log
const settingsManager = require('../utils/settingsManager');
const { ActionLog } = require('../utils/database');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const settings = await settingsManager.getGuildSettings(member.guild.id);

    // --- Stats Channel Update ---
    if (settings.statsChannelId) {
      const ch = member.guild.channels.cache.get(settings.statsChannelId);
      if (ch) ch.setName(`📊 Members: ${member.guild.memberCount}`).catch(() => {});
    }

    // --- Auto Roles ---
    if (settings.modules?.autoRoles && settings.autoRoleIds?.length > 0) {
      for (const roleId of settings.autoRoleIds) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) await member.roles.add(role).catch(() => {});
      }
    }

    // --- Visual Welcome Card ---
    if (settings.modules?.welcome !== false && settings.welcomeChannel) {
      const welcomeChannel = member.guild.channels.cache.get(settings.welcomeChannel);
      if (welcomeChannel) {
        const joinMsg = (settings.welcomeSettings?.joinMessage || 'Welcome {user} to {server}!')
          .replace(/{user}/g, member.toString())
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, member.guild.name)
          .replace(/{memberCount}/g, member.guild.memberCount);

        try {
          const { AttachmentBuilder } = require('discord.js');
          const canvacord = require('canvacord');
          const welcome = new canvacord.Welcomer()
            .setUsername(member.user.username)
            .setDiscriminator(member.user.discriminator === '0' ? '' : member.user.discriminator)
            .setMemberCount(member.guild.memberCount)
            .setGuildName(member.guild.name)
            .setAvatar(member.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 }))
            .setColor('title', '#8b5cf6')
            .setColor('title-border', '#ffffff')
            .setColor('avatar', '#8b5cf6');
            
          if (settings.welcomeSettings?.joinBannerUrl) {
            welcome.setBackground(settings.welcomeSettings.joinBannerUrl);
          }

          const data = await welcome.build();
          const attachment = new AttachmentBuilder(data, { name: 'welcome.png' });
          welcomeChannel.send({ content: `🚨 **NEW CHALLENGER APPROACHES!**\n${joinMsg}`, files: [attachment] }).catch(console.error);
        } catch {
          welcomeChannel.send(`🚨 **NEW CHALLENGER APPROACHES!**\n${joinMsg}`).catch(() => {});
        }
      }
    }

    // --- Announcements: Join ---
    if (settings.modules?.announcements) {
      const ann = settings.announcementSettings || {};
      if (ann.joinChannel) {
        const ch = member.guild.channels.cache.get(ann.joinChannel);
        if (ch) {
          const msg = (ann.joinMessage || '{user} joined the server!')
            .replace(/{user}/g, member.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);
          ch.send(msg).catch(() => {});
        }
      }
    }

    // --- Audit Log (Discord + DB) ---
    const { sendLog } = require('../utils/logger');
    sendLog(member.guild, 'Member Joined 🟢', `**User:** ${member}\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, '#22c55e', member.user);

    await ActionLog.create({
      guildId: member.guild.id,
      type: 'member_join',
      title: '🟢 Member Joined',
      description: `**${member.user.tag}** joined the server`,
      userId: member.user.id,
      username: member.user.tag
    }).catch(() => {});
  }
};
