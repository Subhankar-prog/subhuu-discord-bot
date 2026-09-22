require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

// Ensure data directory exists before any managers are loaded
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const { Client, GatewayIntentBits, Collection, MessageFlags, Partials,
        StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');
const { buildNowPlayingEmbed, buildMusicButtons } = require('./utils/nowPlaying');
const { connectDB } = require('./utils/database');
const pm = require('./utils/playlistManager');
const reminderManager = require('./utils/reminderManager');
const socialAlerts = require('./utils/socialAlerts');

// Connect to MongoDB
connectDB().then(() => {
  console.log('MongoDB connection initialized.');
}).catch(console.error);

// Make the bundled ffmpeg binary discoverable by DisTube and prism-media
const ffmpegStatic = require('ffmpeg-static');
process.env.PATH = require('path').dirname(ffmpegStatic) + require('path').delimiter + (process.env.PATH || '');
process.env.FFMPEG_PATH = ffmpegStatic;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions, // needed for reaction roles
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// ---- Music player (DisTube) ----
// YtDlpPlugin uses yt-dlp under the hood, which currently handles YouTube's
// anti-bot measures better than older ytdl-core-only setups.
client.distube = new DisTube(client, {
  plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YtDlpPlugin({ update: true })],
  emitNewSongOnly: true,
});

// ---- Track the "Now Playing" message per guild so we can delete/update it ----
const nowPlayingMessages = new Map(); // guildId -> Message

// ---- Load slash commands from /commands ----
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// ---- Load events from /events ----
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ---- Handle all interactions (slash commands + music buttons) ----
client.on('interactionCreate', async interaction => {
  // ---- Music button handler ----
  if (interaction.isButton() && interaction.customId.startsWith('music_')) {
    return handleMusicButton(interaction);
  }

  // ---- Select menu handlers ----
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'queue_select')         return handleQueueSelect(interaction);
    if (interaction.customId === 'save_playlist_select') return handleSavePlaylistSelect(interaction);
    return;
  }

  // ---- Slash command handler ----
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`Error running /${interaction.commandName}:`, err);
    const payload = { content: 'Something went wrong running that command.', flags: MessageFlags.Ephemeral };
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    } catch (replyErr) {
      console.error('Could not send error reply:', replyErr.message);
    }
  }
});

// ---- Prevent unhandled error events from crashing the process ----
client.on('error', err => console.error('Discord client error:', err.message));

// ---- Music button interaction logic ----
async function handleMusicButton(interaction) {
  const queue = client.distube.getQueue(interaction.guildId);

  if (!queue) {
    return interaction.reply({ content: '❌ Nothing is playing right now.', flags: MessageFlags.Ephemeral });
  }

  const { customId } = interaction;

  try {
    switch (customId) {

      case 'music_prev': {
        try {
          await queue.previous();
          await interaction.reply({ content: '⏮ Playing previous song!', flags: MessageFlags.Ephemeral });
        } catch {
          await interaction.reply({ content: '⏮ No previous song available.', flags: MessageFlags.Ephemeral });
        }
        break;
      }

      case 'music_pause': {
        await interaction.deferUpdate(); // acknowledge immediately
        if (queue.paused) {
          queue.resume();
        } else {
          queue.pause();
        }
        const updatedComponents = buildMusicButtons(queue.paused);
        await interaction.message.edit({ components: updatedComponents });
        break;
      }

      case 'music_skip': {
        try {
          await queue.skip();
          await interaction.reply({ content: '⏭ Skipped!', flags: MessageFlags.Ephemeral });
        } catch {
          await interaction.reply({ content: '⏭ Nothing left to skip to.', flags: MessageFlags.Ephemeral });
        }
        break;
      }

      case 'music_vol_down': {
        await interaction.deferUpdate(); // acknowledge immediately
        const newVol = Math.max(0, queue.volume - 10);
        queue.setVolume(newVol);
        const updatedEmbed = buildNowPlayingEmbed(queue.songs[0], queue);
        await interaction.message.edit({ embeds: [updatedEmbed] });
        break;
      }

      case 'music_vol_up': {
        await interaction.deferUpdate(); // acknowledge immediately
        const newVol = Math.min(100, queue.volume + 10);
        queue.setVolume(newVol);
        const updatedEmbed = buildNowPlayingEmbed(queue.songs[0], queue);
        await interaction.message.edit({ embeds: [updatedEmbed] });
        break;
      }

      case 'music_queue_picker': {
        return handleQueuePicker(interaction);
      }

      case 'music_save_playlist': {
        return handleSavePlaylist(interaction);
      }

      case 'music_stop': {
        nowPlayingMessages.delete(interaction.guildId);
        await queue.stop();
        await interaction.reply({ content: '⏹ Stopped playback and cleared the queue.', flags: MessageFlags.Ephemeral });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Music button error:', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Something went wrong.', flags: MessageFlags.Ephemeral });
    }
  }
}

// ---- Queue Picker button → send ephemeral select menu ----
async function handleQueuePicker(interaction) {
  const queue = client.distube.getQueue(interaction.guildId);
  if (!queue || !queue.songs.length) {
    return interaction.reply({ content: '❌ Nothing is playing right now.', flags: MessageFlags.Ephemeral });
  }

  const songs = queue.songs.slice(0, 25); // Discord select menus max 25 options
  const menu  = new StringSelectMenuBuilder()
    .setCustomId('queue_select')
    .setPlaceholder('Choose a song to jump to…')
    .addOptions(
      songs.map((s, i) => {
        const label = (i === 0 ? '▶️ ' : `${i + 1}. `) + (s.name || 'Unknown').slice(0, 95);
        return new StringSelectMenuOptionBuilder()
          .setLabel(label)
          .setValue(String(i))
          .setDescription((s.formattedDuration || 'Unknown duration').slice(0, 100))
          .setDefault(i === 0);
      })
    );

  const row = new ActionRowBuilder().addComponents(menu);
  return interaction.reply({
    content: `📋 **Queue** (${queue.songs.length} song${queue.songs.length !== 1 ? 's' : ''})`
      + (queue.songs.length > 25 ? ' — showing first 25' : '') + ':',
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

// ---- Queue select menu → jump to chosen song ----
async function handleQueueSelect(interaction) {
  const queue = client.distube.getQueue(interaction.guildId);
  if (!queue) {
    return interaction.update({ content: '❌ Nothing is playing right now.', components: [] });
  }

  const index = parseInt(interaction.values[0], 10);
  if (index === 0) {
    return interaction.update({ content: '▶️ That song is already playing!', components: [] });
  }

  try {
    await client.distube.jump(interaction.guildId, index);
    const songName = queue.songs[index]?.name || 'that song';
    return interaction.update({ content: `⏭ Jumped to **${songName}**!`, components: [] });
  } catch (err) {
    console.error('[queue_select jump]', err);
    return interaction.update({ content: '❌ Could not jump to that song.', components: [] });
  }
}

// ---- Save to Playlist button → send ephemeral playlist picker ----
async function handleSavePlaylist(interaction) {
  const queue = client.distube.getQueue(interaction.guildId);
  if (!queue || !queue.songs.length) {
    return interaction.reply({ content: '❌ Nothing is playing right now.', flags: MessageFlags.Ephemeral });
  }

  const playlists = pm.getUserPlaylists(interaction.guildId, interaction.user.id);
  const keys      = Object.keys(playlists);

  if (keys.length === 0) {
    return interaction.reply({
      content: '📋 You have no playlists yet. Create one with `/playlist create` first!',
      flags: MessageFlags.Ephemeral,
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('save_playlist_select')
    .setPlaceholder('Choose a playlist to save this song to…')
    .addOptions(
      keys.slice(0, 25).map(k =>
        new StringSelectMenuOptionBuilder()
          .setLabel(k.slice(0, 100))
          .setValue(k)
          .setDescription(`${playlists[k].length} / ${pm.MAX_SONGS} songs`)
      )
    );

  const row  = new ActionRowBuilder().addComponents(menu);
  const song = queue.songs[0];
  return interaction.reply({
    content: `💾 Save **${song.name}** to which playlist?`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

// ---- Save playlist select → add current song to chosen playlist ----
async function handleSavePlaylistSelect(interaction) {
  const queue = client.distube.getQueue(interaction.guildId);
  if (!queue || !queue.songs.length) {
    return interaction.update({ content: '❌ Nothing is playing right now.', components: [] });
  }

  const plName = interaction.values[0];
  const song   = queue.songs[0];
  const result = pm.addSong(
    interaction.guildId,
    interaction.user.id,
    plName,
    { name: song.name, url: song.url }
  );

  if (result.error) return interaction.update({ content: `❌ ${result.error}`, components: [] });
  return interaction.update({
    content: `✅ Saved **${song.name}** to playlist **${plName}**!`,
    components: [],
  });
}

client.distube
  .on('playSong', async (queue, song) => {
    // Delete the previous Now Playing card if it exists
    const oldMsg = nowPlayingMessages.get(queue.id);
    if (oldMsg) {
      try { await oldMsg.delete(); } catch { /* already deleted */ }
    }

    // Send the new Now Playing card with control buttons
    const embed = buildNowPlayingEmbed(song, queue);
    const components = buildMusicButtons(false);
    const msg = await queue.textChannel?.send({ embeds: [embed], components });
    
    // Prevent race condition: if queue finished before message sent, delete it
    if (client.distube.getQueue(queue.id)) {
      if (msg) nowPlayingMessages.set(queue.id, msg);
    } else if (msg) {
      msg.delete().catch(() => {});
    }

    // Web Music Player broadcast
    if (global.io) {
      global.io.to(`music_${queue.id}`).emit('music_play', {
        name: song.name,
        thumbnail: song.thumbnail,
        duration: song.formattedDuration,
        queueLength: queue.songs.length
      });
    }
  });
  // Capture debug logs to send to the channel
  const debugLogs = new Map();

  client.distube
  .on('addSong', async (queue, song) => {
    queue.textChannel?.send(`✅ Added to queue: **${song.name}** (\`${song.formattedDuration}\`)`);
    
    // Update the existing Now Playing card with the new queue count and "Up next" text
    const msg = nowPlayingMessages.get(queue.id);
    if (msg) {
      const updatedEmbed = buildNowPlayingEmbed(queue.songs[0], queue);
      try { await msg.edit({ embeds: [updatedEmbed] }); } catch (err) {}
    }

    if (global.io) {
      global.io.to(`music_${queue.id}`).emit('music_add', {
        name: song.name,
        queueLength: queue.songs.length
      });
    }
  })
  .on('addList', async (queue, playlist) => {
    queue.textChannel?.send(`✅ Added playlist to queue: **${playlist.name}** (${playlist.songs.length} songs)`);
    
    // Update the existing Now Playing card with the new queue count
    const msg = nowPlayingMessages.get(queue.id);
    if (msg) {
      const updatedEmbed = buildNowPlayingEmbed(queue.songs[0], queue);
      try { await msg.edit({ embeds: [updatedEmbed] }); } catch (err) {}
    }

    if (global.io) {
      global.io.to(`music_${queue.id}`).emit('music_addList', {
        name: playlist.name,
        queueLength: queue.songs.length
      });
    }
  })
  .on('error', (e, queue) => {
    console.error('[DisTube ERROR]', e);
    queue?.textChannel?.send(`❌ Error: ${e.message.slice(0, 100)}... Try another link.`);
  })
  .on('debug', message => {
    console.log('[DisTube DEBUG]', message);
    // Extract queue ID if possible, otherwise store globally (not perfect but works for debugging 1 queue)
    const logs = debugLogs.get('global') || [];
    logs.push(message.slice(0, 200));
    if (logs.length > 5) logs.shift();
    debugLogs.set('global', logs);
  })
  .on('finish', queue => {
    nowPlayingMessages.delete(queue.id);
    const logs = (debugLogs.get('global') || []).join('\n');
    queue.textChannel?.send('✅ Queue finished!\n\n**DEBUG LOGS (Last 5 events):**\n```\n' + logs + '\n```');
    debugLogs.set('global', []);
    if (global.io) global.io.to(`music_${queue.id}`).emit('music_stop');
  })
  .on('empty', queue => {
    queue.textChannel?.send('👋 Voice channel is empty, leaving.');
    if (global.io) global.io.to(`music_${queue.id}`).emit('music_stop');
  });

// --- KEEP ALIVE ---
// Pings the Render URL every 14 minutes to prevent the free tier from sleeping
const RENDER_URL = 'https://subhuu-discord-bot.onrender.com';
setInterval(() => {
  fetch(RENDER_URL).catch(() => {});
}, 14 * 60 * 1000);

client.login(process.env.DISCORD_TOKEN);
