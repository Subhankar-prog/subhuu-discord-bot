const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolepanel')
    .setDescription('Creates a Button Reaction Role panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('title').setDescription('Panel Title').setRequired(true))
    .addRoleOption(opt => opt.setName('role1').setDescription('First Role').setRequired(true))
    .addStringOption(opt => opt.setName('label1').setDescription('Button 1 Text').setRequired(true))
    .addRoleOption(opt => opt.setName('role2').setDescription('Second Role').setRequired(false))
    .addStringOption(opt => opt.setName('label2').setDescription('Button 2 Text').setRequired(false))
    .addRoleOption(opt => opt.setName('role3').setDescription('Third Role').setRequired(false))
    .addStringOption(opt => opt.setName('label3').setDescription('Button 3 Text').setRequired(false)),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(title)
      .setDescription('Click the buttons below to assign or remove roles!');

    const row = new ActionRowBuilder();

    for (let i = 1; i <= 3; i++) {
      const role = interaction.options.getRole(`role${i}`);
      const label = interaction.options.getString(`label${i}`);
      
      if (role && label) {
        row.addComponents(
          new ButtonBuilder()
            // We pass the role ID in the custom ID so the interaction handler knows what to assign
            .setCustomId(`rr_${role.id}`)
            .setLabel(label)
            .setStyle(ButtonStyle.Secondary)
        );
      }
    }

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Role panel created successfully!', ephemeral: true });
  },
};
