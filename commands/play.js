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
      if (query.includes('youtube.com/watch') || query.includes('youtu.be/')) {
        try {
          // Use YouTube's official oEmbed API (used for Discord/Twitter link previews)
          // This endpoint is rarely IP-banned because it's meant for servers.
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(query)}&format=json`;
          const response = await fetch(oembedUrl);
          if (response.ok) {
            const data = await response.json();
            if (data && data.title) {
              let cleanTitle = data.title;
              // Remove SEO spam and tags like (Official Video) for better SoundCloud searches
              cleanTitle = cleanTitle.split('|')[0];
              cleanTitle = cleanTitle.split(/\[|\(/)[0];
              cleanTitle = cleanTitle.trim();
              
              finalQuery = 'scsearch:' + cleanTitle;
              console.log(`[YouTube Intercept] Converted URL via oEmbed: ${finalQuery}`);
            }
          }
        } catch (fetchErr) {
          console.error('[YouTube Intercept] oEmbed failed:', fetchErr);
        }
        
        // If we failed to convert it to a SoundCloud search, it means YouTube completely firewalled us.
        if (!finalQuery.startsWith('scsearch:')) {
          return interaction.editReply('❌ **YouTube Firewall Block!** YouTube completely blocked the server from reading this link. \n\n👉 **PLEASE FIX:** Just type the name of the song instead of pasting the link (Example: `/play query: post malone`).');
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
      const errMsg = err.message || err.toString();
      await interaction.editReply(`❌ **Error:** ${errMsg}`);
    }
  },
};
