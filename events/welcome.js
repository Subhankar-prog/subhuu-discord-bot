const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const settings = require('../utils/settingsManager').getGuildSettings(member.guild.id);
    const channelId = settings.welcomeChannel;
    if (!channelId) return; // welcome messages disabled if not configured

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('Welcome! 👋')
      .setDescription(`${member} just joined **${member.guild.name}**. Glad to have you here!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(0x57f287)
      .setFooter({ text: `Member #${member.guild.memberCount}` });

    channel.send({ embeds: [embed] }).catch(console.error);
  },
};
