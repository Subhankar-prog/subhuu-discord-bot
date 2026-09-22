const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection, joinVoiceChannel, EndBehaviorType, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const prism = require('prism-media');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const googleTTS = require('google-tts-api');
const ffmpegStatic = require('ffmpeg-static');
const child_process = require('child_process');

const activeLoops = new Map();

async function processConversation(interaction, client, connection, userId) {
  const guildId = interaction.guildId;
  
  if (!activeLoops.get(guildId)) return false; // Exit signal received

  try {
    const receiver = connection.receiver;
    const stream = receiver.subscribe(userId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 700 }, // Reduced from 1500ms to make it much snappier
    });

    const opusDecoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
    const filename = `temp-${userId}-${Date.now()}.mp3`;
    const filepath = path.join(__dirname, '..', filename);
    
    const ffmpegProcess = child_process.spawn(ffmpegStatic, [
      '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', 'pipe:0', '-f', 'mp3', filepath
    ]);

    stream.pipe(opusDecoder).pipe(ffmpegProcess.stdin);

    await new Promise((resolve, reject) => {
      ffmpegProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });

    if (!activeLoops.get(guildId)) { fs.unlinkSync(filepath); return false; }

    const stats = fs.statSync(filepath);
    if (stats.size < 1000) {
      fs.unlinkSync(filepath);
      // Wait a moment and restart loop silently if nothing was heard
      await new Promise(r => setTimeout(r, 1000));
      return true; 
    }

    // Send to Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' }); 

    const audioBuffer = fs.readFileSync(filepath);
    const base64Data = audioBuffer.toString('base64');
    fs.unlinkSync(filepath); // cleanup immediately
    
    const prompt = `
      You are a voice assistant named Jarvis in a Discord call. 
      Keep your answers VERY brief and punchy, ideally just one short sentence. 
      DO NOT use markdown, emojis, or symbols, as this will be read aloud.
      If the user says something that sounds like a farewell (e.g. "goodbye", "stop", "shut up", "bye", "that's all"), you MUST end your response exactly with the phrase "GOODBYE_SIGNAL".
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'audio/mp3', data: base64Data } }
    ]);

    const responseText = result.response.text().trim();
    
    const isFarewell = responseText.includes("GOODBYE_SIGNAL");
    const cleanResponse = responseText.replace("GOODBYE_SIGNAL", "").trim();

    // Play TTS
    const ttsUrl = googleTTS.getAudioUrl(cleanResponse || "I didn't quite catch that.", {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(ttsUrl);
    
    player.play(resource);
    connection.subscribe(player);

    await new Promise(resolve => {
      player.on(AudioPlayerStatus.Idle, resolve);
      player.on('error', resolve);
    });

    // Check exit condition
    if (isFarewell || !activeLoops.get(guildId)) {
      return false; 
    }

    return true; // continue loop

  } catch (err) {
    console.error('Conversation loop error:', err);
    return false; // break loop on fatal error
  }
}

module.exports = {
  activeLoops,
  data: new SlashCommandBuilder()
    .setName('listen')
    .setDescription('Start a continuous conversation loop with the AI'),
  async execute(interaction, client) {
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) return interaction.reply({ content: '❌ You must be in a voice channel!', ephemeral: true });

    const queue = client.distube.getQueue(interaction.guildId);
    if (queue && queue.playing) return interaction.reply({ content: '❌ Please pause the music before using the voice assistant.', ephemeral: true });

    if (activeLoops.get(interaction.guildId)) {
      return interaction.reply({ content: '❌ I am already listening to someone in this server!', ephemeral: true });
    }

    await interaction.deferReply();

    let connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
    } else if (connection.joinConfig.selfDeaf) {
      connection.rejoin({ ...connection.joinConfig, selfDeaf: false });
    }

    activeLoops.set(interaction.guildId, true);
    await interaction.editReply('🎙️ **Continuous Conversation Started!**\nSpeak now. The bot will automatically reply and keep listening to you until you say "Goodbye" or run `/stoplisten`.');

    // Run the loop in the background
    (async () => {
      let keepGoing = true;
      while (keepGoing && activeLoops.get(interaction.guildId)) {
        keepGoing = await processConversation(interaction, client, connection, interaction.user.id);
      }
      
      // Cleanup
      activeLoops.delete(interaction.guildId);
      interaction.channel.send('🛑 **Conversation ended.**');
      
      if (client.distube.getQueue(interaction.guildId)) {
        connection.rejoin({ ...connection.joinConfig, selfDeaf: true });
      } else {
        connection.destroy();
      }
    })();
  },
};
