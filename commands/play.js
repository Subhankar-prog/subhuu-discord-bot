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
      let finalQuery = query;
      // 1. Force raw text searches to use SoundCloud
      if (!query.startsWith('http') && !query.startsWith('scsearch:') && !query.startsWith('ytsearch:')) {
        finalQuery = 'scsearch:' + query;
      }

      // 2. Intercept YouTube links and seamlessly route them to SoundCloud
      // (Bypasses Render datacenter IP blocks completely without needing cookies)
      if (query.includes('youtube.com/watch') || query.includes('youtu.be/')) {
        try {
          const YouTube = require('youtube-sr').default;
          const video = await YouTube.getVideo(query);
          if (video && video.title) {
            finalQuery = 'scsearch:' + video.title;
            console.log(`[YouTube Intercept] Converted URL to search: ${finalQuery}`);
          }
        } catch (fetchErr) {
          console.error('[YouTube Intercept] Failed to scrape title using youtube-sr:', fetchErr);
        }
      }

      await client.distube.play(voiceChannel, finalQuery, {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction,
      });
      await interaction.editReply(`🔎 Searching for: **${finalQuery.replace('scsearch:', '')}**...`);
    } catch (err) {
      console.error('[play] Full error:', err);
      await interaction.editReply('Could not play that link/search — it may be blocked, private, or unsupported.');
    }
  },
};
