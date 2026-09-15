const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop music and clear the queue'),
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    queue.stop();
    await interaction.reply('Stopped playback and cleared the queue.');
  },
};
