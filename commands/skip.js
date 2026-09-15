const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Skip the current song'),
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    try {
      const nextSong = queue.songs.length > 1 ? await queue.skip() : null;
      await interaction.reply(nextSong ? `Skipped! Now playing: **${nextSong.name}**` : 'Skipped the last song, queue is empty now.');
    } catch (err) {
      await interaction.reply({ content: 'Nothing left to skip to.', ephemeral: true });
    }
  },
};
