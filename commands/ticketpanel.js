const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Creates a Support Ticket panel (Requires Tickets module)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isModuleEnabled(interaction.guildId, 'tickets')) {
      return interaction.reply({ 
        content: '❌ **Tickets Module is disabled.** Enable it in the Web Dashboard first.', 
        ephemeral: true 
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🎫 Support Tickets')
      .setDescription('Need help? Click the button below to open a private ticket with the staff team.');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('Open Ticket')
        .setEmoji('📩')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Ticket panel created successfully!', ephemeral: true });
  },
};
