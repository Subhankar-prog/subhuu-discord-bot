const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Show the current music queue'),
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });

    const list = queue.songs
      .slice(0, 10)
      .map((song, i) => `${i === 0 ? 'Now Playing' : `${i}.`} — **${song.name}** (\`${song.formattedDuration}\`)`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Music Queue')
      .setDescription(list)
      .setFooter({ text: queue.songs.length > 10 ? `+${queue.songs.length - 10} more song(s)` : `${queue.songs.length} song(s) in queue` })
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  },
};
