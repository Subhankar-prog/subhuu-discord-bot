const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube, SoundCloud, Spotify, or a search term')
    .addStringOption(opt =>
      opt.setName('query').setDescription('URL or search term').setRequired(true)
    ),
  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: 'Join a voice channel first!', ephemeral: true });
    }

    await interaction.deferReply();
    try {
      await client.distube.play(voiceChannel, query, {
        textChannel: interaction.channel,
        member: interaction.member,
      });
      await interaction.editReply(`Searching for: **${query}**`);
    } catch (err) {
      console.error('[play] Full error:', err);
      await interaction.editReply('Could not play that link/search — it may be blocked, private, or unsupported.');
    }
  },
};
