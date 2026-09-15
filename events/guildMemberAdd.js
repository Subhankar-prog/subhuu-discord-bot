const settingsManager = require('../utils/settingsManager');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const settings = settingsManager.getGuildSettings(member.guild.id);
    if (settings.statsChannelId) {
      const channel = member.guild.channels.cache.get(settings.statsChannelId);
      if (channel) {
        // Discord rate limits channel renaming to 2 times per 10 minutes,
        // so we catch the error if it's hit, but it usually works for steady growth.
        channel.setName(`📊 Members: ${member.guild.memberCount}`).catch(() => {});
      }
    }
    
    // Visual Welcome Card logic
    if (settings.welcomeChannel) {
      const welcomeChannel = member.guild.channels.cache.get(settings.welcomeChannel);
      if (welcomeChannel) {
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

          const data = await welcome.build();
          const attachment = new AttachmentBuilder(data, { name: 'welcome.png' });

          welcomeChannel.send({ 
            content: `🎉 Welcome to **${member.guild.name}**, ${member}!`, 
            files: [attachment] 
          }).catch(console.error);
        } catch (err) {
          console.error('[Welcome Card Error]', err);
          // Fallback to text if image generation fails
          welcomeChannel.send(`Welcome to the server, ${member}! We now have ${member.guild.memberCount} members.`).catch(() => {});
        }
      }
    }
    // Audit Logging
    const { sendLog } = require('../utils/logger');
    sendLog(member.guild, 'Member Joined 🟢', `**User:** ${member}\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, '#22c55e', member.user);

  },
};
