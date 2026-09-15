const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imagine')
    .setDescription('Generate an AI image from a text prompt (Requires Economy/Fun module)')
    .addStringOption(opt => opt.setName('prompt').setDescription('What do you want to generate?').setRequired(true)),

  async execute(interaction) {
    if (!isModuleEnabled(interaction.guildId, 'economy')) {
      return interaction.reply({ 
        content: '❌ **Economy & Fun Module is disabled.** Enable it in the Web Dashboard first.', 
        ephemeral: true 
      });
    }

    const prompt = interaction.options.getString('prompt');
    await interaction.deferReply(); // Generating can take a few seconds

    try {
      // Pollinations AI URL generation. We append a random seed so it generates a fresh image each time.
      const seed = Math.floor(Math.random() * 100000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true`;

      const embed = new EmbedBuilder()
        .setColor('#e84393')
        .setTitle('🎨 AI Image Generator')
        .setDescription(`**Prompt:** ${prompt}`)
        .setImage(imageUrl)
        .setFooter({ text: `Generated for ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Failed to generate the image. Please try again later.');
    }
  },
};
