const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require('discord.js');
const { json: ytdlpJson } = require('@distube/yt-dlp');
const pm = require('../utils/playlistManager');

// ---- yt-dlp resolve helper (no playback) ----------------------------

async function resolveInfo(query) {
  const isUrl   = /^https?:\/\//i.test(query);
  const target  = isUrl ? query : `ytsearch1:${query}`;
  return ytdlpJson(target, {
    dumpSingleJson:      true,
    noWarnings:          true,
    preferFreeFormats:   true,
    skipDownload:        true,
    simulate:            true,
    flatPlaylist:        true,   // fast: don't fetch metadata per entry
  });
}

// ---- Command definition ---------------------------------------------

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Manage your personal song playlists')

    .addSubcommand(sub => sub
      .setName('create')
      .setDescription('Create a new playlist')
      .addStringOption(o => o.setName('name').setDescription('Name for your playlist').setRequired(true).setMaxLength(32)))

    .addSubcommand(sub => sub
      .setName('add')
      .setDescription('Add a song (or small playlist) to one of your playlists')
      .addStringOption(o => o.setName('playlist').setDescription('Your playlist name').setRequired(true))
      .addStringOption(o => o.setName('query').setDescription('YouTube/Spotify URL or search term').setRequired(true)))

    .addSubcommand(sub => sub
      .setName('import')
      .setDescription('Import an entire YouTube or Spotify playlist into one of yours')
      .addStringOption(o => o.setName('playlist').setDescription('Your playlist name to import into').setRequired(true))
      .addStringOption(o => o.setName('url').setDescription('YouTube or Spotify playlist URL').setRequired(true)))

    .addSubcommand(sub => sub
      .setName('play')
      .setDescription('Play one of your playlists in the current voice channel')
      .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true)))

    .addSubcommand(sub => sub
      .setName('view')
      .setDescription('See all songs in a playlist')
      .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true)))

    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('List all your playlists'))

    .addSubcommand(sub => sub
      .setName('remove')
      .setDescription('Remove a song from a playlist')
      .addStringOption(o => o.setName('playlist').setDescription('Playlist name').setRequired(true))
      .addIntegerOption(o => o.setName('index').setDescription('Song number (from /playlist view)').setRequired(true).setMinValue(1)))

    .addSubcommand(sub => sub
      .setName('delete')
      .setDescription('Delete an entire playlist permanently')
      .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true))),

  // ---- Handler -------------------------------------------------------

  async execute(interaction, client) {
    const sub     = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const userId  = interaction.user.id;

    // ── CREATE ──────────────────────────────────────────────────────────
    if (sub === 'create') {
      const name   = interaction.options.getString('name');
      const result = pm.createPlaylist(guildId, userId, name);
      if (result.error) return interaction.reply({ content: `❌ ${result.error}`, flags: MessageFlags.Ephemeral });
      return interaction.reply({
        content: `✅ Playlist **${name}** created!\nAdd songs: \`/playlist add playlist:${name} query:<url or name>\``,
        flags: MessageFlags.Ephemeral,
      });
    }

    // ── LIST ─────────────────────────────────────────────────────────────
    if (sub === 'list') {
      const playlists = pm.getUserPlaylists(guildId, userId);
      const keys      = Object.keys(playlists);
      if (keys.length === 0) {
        return interaction.reply({
          content: '📋 You have no playlists yet. Create one with `/playlist create`!',
          flags: MessageFlags.Ephemeral,
        });
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📋 Your Playlists')
        .setDescription(
          keys.map((k, i) => `**${i + 1}.** ${k} — ${playlists[k].length} song${playlists[k].length !== 1 ? 's' : ''}`).join('\n')
        )
        .setFooter({ text: `${keys.length} / ${pm.MAX_PLAYLISTS} playlists` });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // ── VIEW ─────────────────────────────────────────────────────────────
    if (sub === 'view') {
      const name   = interaction.options.getString('name');
      const result = pm.getPlaylist(guildId, userId, name);
      if (!result) return interaction.reply({ content: `❌ Playlist **${name}** not found.`, flags: MessageFlags.Ephemeral });

      const { key, songs } = result;
      if (songs.length === 0) {
        return interaction.reply({
          content: `📋 **${key}** is empty. Add songs with \`/playlist add\`.`,
          flags: MessageFlags.Ephemeral,
        });
      }
      const lines = songs.slice(0, 25).map((s, i) => `**${i + 1}.** [${s.name}](${s.url})`);
      if (songs.length > 25) lines.push(`*…and ${songs.length - 25} more songs*`);
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📋 ${key}`)
        .setDescription(lines.join('\n'))
        .setFooter({ text: `${songs.length} / ${pm.MAX_SONGS} songs  •  /playlist remove to delete a song` });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // ── ADD ──────────────────────────────────────────────────────────────
    if (sub === 'add') {
      const plName = interaction.options.getString('playlist');
      const query  = interaction.options.getString('query');

      const pl = pm.getPlaylist(guildId, userId, plName);
      if (!pl) return interaction.reply({ content: `❌ Playlist **${plName}** not found.`, flags: MessageFlags.Ephemeral });

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      try {
        const info = await resolveInfo(query);

        // Playlist URL → bulk add its entries
        if (info._type === 'playlist' && Array.isArray(info.entries)) {
          const songs  = info.entries.map(e => ({ name: e.title || e.id, url: e.url || e.webpage_url }));
          const result = pm.addSongs(guildId, userId, pl.key, songs);
          if (result.error) return interaction.editReply(`❌ ${result.error}`);
          return interaction.editReply(
            `✅ Added **${result.added}** songs to **${pl.key}**` +
            (result.skipped > 0 ? ` (${result.skipped} duplicates skipped)` : '') + '.'
          );
        }

        // Single song
        const song   = { name: info.title || info.fulltitle || 'Unknown', url: info.webpage_url || info.original_url };
        const result = pm.addSong(guildId, userId, pl.key, song);
        if (result.error) return interaction.editReply(`❌ ${result.error}`);
        return interaction.editReply(`✅ Added **${song.name}** to **${pl.key}**.`);

      } catch (err) {
        console.error('[playlist add]', err);
        return interaction.editReply('❌ Could not resolve that link or search term. Try a direct YouTube URL.');
      }
    }

    // ── IMPORT ───────────────────────────────────────────────────────────
    if (sub === 'import') {
      const plName = interaction.options.getString('playlist');
      const url    = interaction.options.getString('url');

      const pl = pm.getPlaylist(guildId, userId, plName);
      if (!pl) return interaction.reply({ content: `❌ Playlist **${plName}** not found.`, flags: MessageFlags.Ephemeral });

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      try {
        const info = await resolveInfo(url);
        if (info._type !== 'playlist' || !Array.isArray(info.entries)) {
          return interaction.editReply('❌ That looks like a single song, not a playlist. Use `/playlist add` instead.');
        }
        const songs  = info.entries.map(e => ({ name: e.title || e.id, url: e.url || e.webpage_url }));
        const result = pm.addSongs(guildId, userId, pl.key, songs);
        if (result.error) return interaction.editReply(`❌ ${result.error}`);
        return interaction.editReply(
          `✅ Imported **${result.added}** songs into **${pl.key}**` +
          (result.skipped > 0 ? ` (${result.skipped} duplicates skipped)` : '') + '.'
        );
      } catch (err) {
        console.error('[playlist import]', err);
        return interaction.editReply('❌ Could not import that playlist. Make sure it\'s a public YouTube or Spotify playlist URL.');
      }
    }

    // ── PLAY ─────────────────────────────────────────────────────────────
    if (sub === 'play') {
      const name = interaction.options.getString('name');
      const pl   = pm.getPlaylist(guildId, userId, name);
      if (!pl)             return interaction.reply({ content: `❌ Playlist **${name}** not found.`, flags: MessageFlags.Ephemeral });
      if (!pl.songs.length) return interaction.reply({ content: `❌ **${pl.key}** is empty.`, flags: MessageFlags.Ephemeral });

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel)  return interaction.reply({ content: '❌ Join a voice channel first!', flags: MessageFlags.Ephemeral });

      await interaction.deferReply();

      try {
        const customPlaylist = await client.distube.createCustomPlaylist(
          pl.songs.map(s => s.url),
          { member: interaction.member, properties: { name: pl.key } }
        );
        
        await client.distube.play(voiceChannel, customPlaylist, {
          textChannel: interaction.channel,
          member:      interaction.member,
        });

        return interaction.editReply(`▶️ Playing playlist **${pl.key}** — ${pl.songs.length} song${pl.songs.length !== 1 ? 's' : ''} queued.`);
      } catch (err) {
        console.error('[playlist play]', err);
        return interaction.editReply('❌ There was an error playing this playlist. Some links might be unavailable.');
      }
    }

    // ── REMOVE ───────────────────────────────────────────────────────────
    if (sub === 'remove') {
      const plName = interaction.options.getString('playlist');
      const index  = interaction.options.getInteger('index');
      const result = pm.removeSong(guildId, userId, plName, index);
      if (result.error) return interaction.reply({ content: `❌ ${result.error}`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ content: `✅ Removed **${result.removed.name}** from **${plName}**.`, flags: MessageFlags.Ephemeral });
    }

    // ── DELETE ───────────────────────────────────────────────────────────
    if (sub === 'delete') {
      const name   = interaction.options.getString('name');
      const result = pm.deletePlaylist(guildId, userId, name);
      if (result.error) return interaction.reply({ content: `❌ ${result.error}`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ content: `🗑️ Deleted playlist **${name}**.`, flags: MessageFlags.Ephemeral });
    }
  },
};
