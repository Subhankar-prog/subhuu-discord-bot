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
        const ffmpeg = require('@ffmpeg-installer/ffmpeg');
        const child_process = require('child_process');
        const path = require('path');
        const fs = require('fs');
        const { AttachmentBuilder } = require('discord.js');

        await interaction.editReply('1. Resolving test song via yt-dlp...');
        const song = await plugin.resolve('https://www.youtube.com/watch?v=BaW_vrWEBtc'); 
        const streamUrl = await plugin.getStreamURL(song);
        
        await interaction.editReply(`2. Stream URL acquired! Testing FFmpeg download...`);
        const filepath = path.join(__dirname, '..', `test-${Date.now()}.mp3`);
        
        const args = ['-y', '-i', streamUrl, '-t', '5', '-f', 'mp3', filepath];
        const process = child_process.spawn(ffmpeg.path, args);
        let stderrLog = '';
        
        process.stderr.on('data', data => { stderrLog += data.toString(); });
        
        process.on('close', async (code) => {
          if (code !== 0 || !fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
            const log = stderrLog.slice(-1500);
            return interaction.editReply(`❌ FFmpeg crashed with code ${code}.\n**Logs:**\n\`\`\`\n${log}\n\`\`\``);
          }
          const attachment = new AttachmentBuilder(filepath, { name: 'test-audio.mp3' });
          await interaction.editReply({ content: '✅ FFmpeg successfully downloaded the audio! This proves the issue is UDP/Voice connection dropping on Render!', files: [attachment] });
          fs.unlinkSync(filepath);
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
