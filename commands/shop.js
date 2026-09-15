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
    if (!(await isModuleEnabled(interaction.guildId, 'economy'))) {
      return interaction.reply({ content: '❌ **Economy Module is disabled.**', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const shopItems = await configManager.getShopItems(interaction.guildId);

    if (sub === 'view') {
      const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('🛒 Server Shop')
        .setDescription('Use `/shop buy <item name>` to purchase roles!');
      
      if (shopItems.length === 0) {
        embed.setDescription('The shop is currently empty.');
      } else {
        for (const item of shopItems) {
          embed.addFields({ name: `⭐ ${item.name}`, value: `Cost: **${item.price}** coins`, inline: false });
        }
      }

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'buy') {
      const itemQuery = interaction.options.getString('item').toLowerCase();
      
      // Find item
      const foundItem = shopItems.find(i => i.name.toLowerCase() === itemQuery);

      if (!foundItem) {
        return interaction.reply({ content: `❌ Could not find an item named **${itemQuery}** in the shop.`, ephemeral: true });
      }

      const item = foundItem;
      const guild = interaction.guild;
      const member = interaction.member;

      const bal = await economy.getBalance(guild.id, member.id);
      if (bal < item.price) {
        return interaction.reply({ content: `❌ You do not have enough coins! You need **${item.price}** coins to buy the **${item.name}** role.`, ephemeral: true });
      }

      await interaction.deferReply();

      // Check if role exists
      const role = guild.roles.cache.get(item.roleId);
      if (!role) {
         return interaction.editReply('❌ That shop item is broken (Role does not exist). Ask an admin to recreate it in the Web Dashboard!');
      }

      if (member.roles.cache.has(role.id)) {
        return interaction.editReply('❌ You already own this role!');
      }

      try {
        await member.roles.add(role);
        await economy.removeCoins(guild.id, member.id, item.price);
        interaction.editReply(`🎉 **SUCCESS!** You bought the **${item.name}** role for **${item.price}** coins! Enjoy your new look!`);
      } catch (err) {
        console.error(err);
        interaction.editReply('❌ Failed to give you the role. Ensure my bot role is higher than the role being assigned.');
      }
    }
  }
};
