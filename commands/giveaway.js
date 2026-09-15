const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');

// We use global to easily share this state with interactionCreate.js without circular deps
global.activeGiveaways = new Map(); // messageId -> Set of user IDs

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway (Requires Giveaways module)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
    .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(true))
    .addStringOption(opt => opt.setName('prize').setDescription('What is the prize?').setRequired(true)),

  async execute(interaction) {
    if (!isModuleEnabled(interaction.guildId, 'giveaways')) {
      return interaction.reply({ 
        content: '❌ **Giveaways Module is disabled.** Enable it in the Web Dashboard first.', 
        ephemeral: true 
      });
    }

    const minutes = interaction.options.getInteger('minutes');
    const winnersCount = interaction.options.getInteger('winners');
    const prize = interaction.options.getString('prize');
    
    const endTime = Date.now() + (minutes * 60 * 1000);

    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle(`🎁 GIVEAWAY: ${prize}`)
      .setDescription(`Click the 🎉 button below to enter!\n\n**Winners:** ${winnersCount}\n**Ends:** <t:${Math.floor(endTime / 1000)}:R>`)
      .setFooter({ text: '0 entries so far' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gw_enter')
        .setLabel('Enter Giveaway')
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ content: '✅ Giveaway started!', ephemeral: true });
    const message = await interaction.channel.send({ embeds: [embed], components: [row] });
    
    // Store in global memory
    global.activeGiveaways.set(message.id, new Set());

    // Timer logic
    setTimeout(async () => {
      const entrants = Array.from(global.activeGiveaways.get(message.id) || []);
      global.activeGiveaways.delete(message.id);

      if (entrants.length === 0) {
        embed.setDescription(`**Ended!** Nobody entered.`).setColor('#333333');
        await message.edit({ embeds: [embed], components: [] }).catch(() => {});
        return message.channel.send(`Not enough people entered the giveaway for **${prize}**.`);
      }

      // Pick random winners
      const winners = [];
      for (let i = 0; i < winnersCount; i++) {
        if (entrants.length === 0) break;
        const randomIndex = Math.floor(Math.random() * entrants.length);
        winners.push(entrants.splice(randomIndex, 1)[0]);
      }

      const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
      embed.setDescription(`**Ended!**\n**Winners:** ${winnerMentions}`).setColor('#00ff00');
      
      await message.edit({ embeds: [embed], components: [] }).catch(() => {});
      await message.channel.send(`🎉 Congratulations ${winnerMentions}! You won the **${prize}**!`);
      
    }, minutes * 60 * 1000);
  },
};
