const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const socialAlerts = require('../utils/socialAlerts');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('social')
    .setDescription('Manage social media alerts (YouTube)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => 
      sub.setName('youtube_add')
        .setDescription('Add a YouTube channel to alerts')
        .addStringOption(opt => opt.setName('channel_id').setDescription('The YouTube Channel ID').setRequired(true))
        .addChannelOption(opt => opt.setName('channel').setDescription('Discord channel to post alerts in').setRequired(true))
    )
    .addSubcommand(sub => 
      sub.setName('youtube_remove')
        .setDescription('Remove a YouTube channel from alerts')
        .addStringOption(opt => opt.setName('channel_id').setDescription('The YouTube Channel ID').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    
    if (sub === 'youtube_add') {
      const ytId = interaction.options.getString('channel_id');
      const discordChannel = interaction.options.getChannel('channel');
      
      socialAlerts.addYoutubeAlert(interaction.guildId, discordChannel.id, ytId);
      
      interaction.reply(`✅ Successfully added YouTube channel **${ytId}**. Alerts will be posted in ${discordChannel}!`);
    } 
    
    else if (sub === 'youtube_remove') {
      const ytId = interaction.options.getString('channel_id');
      socialAlerts.removeYoutubeAlert(interaction.guildId, ytId);
      
      interaction.reply(`✅ Removed YouTube channel **${ytId}** from alerts.`);
    }
  }
};
