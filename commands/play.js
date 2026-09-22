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

    if (query === 'testaudio') {
      await interaction.deferReply();
      try {
        const { YtDlpPlugin } = require('@distube/yt-dlp');
        const plugin = new YtDlpPlugin({ update: false });
        const ffmpegStatic = require('ffmpeg-static');
        const child_process = require('child_process');
        const path = require('path');
        const fs = require('fs');
        const { AttachmentBuilder } = require('discord.js');

        const streamUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        
        await interaction.editReply(`2. Stream URL acquired! Testing FFmpeg download...`);
        const filepath = path.join(__dirname, '..', `test-${Date.now()}.mp3`);
        
        const process = child_process.spawn(ffmpegStatic, ['-y', '-i', streamUrl, '-t', '5', '-f', 'mp3', filepath]);
        let stderrLog = '';
        let stdoutLog = '';
        
        process.stdout.on('data', data => { stdoutLog += data.toString(); });
        process.stderr.on('data', data => { stderrLog += data.toString(); });
        
        process.on('close', async (code, signal) => {
          const log = (stdoutLog + stderrLog).slice(-1500);
          return interaction.editReply(`❌ FFmpeg crashed with code ${code}, signal: ${signal}.\n**Logs:**\n\`\`\`\n${log}\n\`\`\``);
        });
      } catch (e) {
        await interaction.editReply(`❌ Network Error: ${e.message}`);
      }
      return;
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
