const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');
const economy = require('../utils/economyManager');
const configManager = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Server Economy Shop')
    .addSubcommand(sub => 
      sub.setName('view').setDescription('View the items in the shop')
    )
    .addSubcommand(sub => 
      sub.setName('buy')
        .setDescription('Buy an item from the shop')
        .addStringOption(opt => 
          opt.setName('item')
            .setDescription('The EXACT name of the item you want to buy (e.g. VIP)')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!isModuleEnabled(interaction.guildId, 'economy')) {
      return interaction.reply({ content: '❌ **Economy Module is disabled.**', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const shopItems = configManager.getShopItems(interaction.guildId);

    if (sub === 'view') {
      const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('🛒 Server Shop')
        .setDescription('Use `/shop buy <item name>` to purchase roles!');
      
      if (Object.keys(shopItems).length === 0) {
        embed.setDescription('The shop is currently empty.');
      } else {
        for (const [key, item] of Object.entries(shopItems)) {
          embed.addFields({ name: `⭐ ${item.name}`, value: `Cost: **${item.price}** coins`, inline: false });
        }
      }

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'buy') {
      const itemQuery = interaction.options.getString('item').toLowerCase();
      
      // Find item
      let foundItem = null;
      for (const [key, item] of Object.entries(shopItems)) {
        if (item.name.toLowerCase() === itemQuery || key.toLowerCase() === itemQuery) {
          foundItem = item;
          break;
        }
      }

      if (!foundItem) {
        return interaction.reply({ content: `❌ Could not find an item named **${itemQuery}** in the shop.`, ephemeral: true });
      }

      const item = foundItem;
      const guild = interaction.guild;
      const member = interaction.member;

      const bal = economy.getBalance(guild.id, member.id);
      if (bal < item.price) {
        return interaction.reply({ content: `❌ You do not have enough coins! You need **${item.price}** coins to buy the **${item.name}** role.`, ephemeral: true });
      }

      await interaction.deferReply();

      // Check if role exists, if not create it
      let role = guild.roles.cache.find(r => r.name === item.name);
      if (!role) {
        try {
          role = await guild.roles.create({
            name: item.name,
            color: item.color,
            hoist: true,
            reason: 'Economy shop purchase'
          });
        } catch (err) {
          console.error(err);
          return interaction.editReply('❌ Failed to create the role. Ensure my bot role is high enough!');
        }
      }

      if (member.roles.cache.has(role.id)) {
        return interaction.editReply('❌ You already own this role!');
      }

      try {
        await member.roles.add(role);
        economy.removeCoins(guild.id, member.id, item.price);
        interaction.editReply(`🎉 **SUCCESS!** You bought the **${item.name}** role for **${item.price}** coins! Enjoy your new look!`);
      } catch (err) {
        console.error(err);
        interaction.editReply('❌ Failed to give you the role. Ensure my bot role is higher than the role being assigned.');
      }
    }
  }
};
