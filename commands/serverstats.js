const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const settingsManager = require('../utils/settingsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Setup a Live Server Stats channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const channel = await interaction.guild.channels.create({
        name: `📊 Members: ${interaction.guild.memberCount}`,
        type: ChannelType.GuildVoice,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.Connect], // Locked channel
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      // Save to settings
      const settings = settingsManager.getGuildSettings(interaction.guildId);
      settings.statsChannelId = channel.id;
      settingsManager.updateGuildSettings(interaction.guildId, settings);

      await interaction.editReply(`✅ Live Server Stats channel created! It will automatically update when members join or leave.`);
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Failed to create the stats channel. Check my permissions.');
    }
  },
};
