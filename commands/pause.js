const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pause or resume the current song'),
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    if (queue.paused) {
      queue.resume();
      await interaction.reply('Resumed.');
    } else {
      queue.pause();
      await interaction.reply('Paused.');
    }
  },
};
