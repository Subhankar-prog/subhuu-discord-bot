const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

/**
 * Builds a rich "Now Playing" embed from a DisTube song + queue.
 * @param {import('distube').Song} song
 * @param {import('distube').Queue} queue
 */
function buildNowPlayingEmbed(song, queue) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2) // Discord blurple
    .setAuthor({
      name: '🎵 Now Playing',
      iconURL: song.user?.displayAvatarURL?.() ?? undefined,
    })
    .setTitle(song.name?.length > 256 ? song.name.slice(0, 253) + '...' : (song.name || 'Unknown'))
    .setURL(song.url || null)
    .addFields(
      { name: '⏱ Duration',    value: song.formattedDuration || '🔴 Live', inline: true },
      { name: '🔊 Volume',      value: `${queue.volume}%`,                  inline: true },
      { name: '📋 In Queue',    value: `${queue.songs.length} song${queue.songs.length !== 1 ? 's' : ''}`, inline: true },
      { name: '👤 Requested by', value: song.user?.toString() || 'Unknown', inline: false },
    )
    .setFooter({
      text: queue.songs.length > 1
        ? `Up next: ${queue.songs[1].name}`
        : 'No more songs in queue',
    });

  // Large banner image if thumbnail available
  if (song.thumbnail) embed.setImage(song.thumbnail);

  return embed;
}

/**
 * Builds 3 action rows with music control + playlist buttons.
 * Row 1 — Playback controls
 * Row 2 — Queue picker + Save to playlist
 * Row 3 — Stop
 * @param {boolean} isPaused
 */
function buildMusicButtons(isPaused = false) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_prev')
      .setEmoji('⏮')
      .setLabel('Prev')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_pause')
      .setEmoji(isPaused ? '▶️' : '⏸')
      .setLabel(isPaused ? 'Resume' : 'Pause')
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setEmoji('⏭')
      .setLabel('Skip')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_vol_down')
      .setEmoji('🔉')
      .setLabel('Vol −')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_vol_up')
      .setEmoji('🔊')
      .setLabel('Vol +')
      .setStyle(ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_queue_picker')
      .setEmoji('📋')
      .setLabel('Queue / Jump')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_save_playlist')
      .setEmoji('💾')
      .setLabel('Save to Playlist')
      .setStyle(ButtonStyle.Secondary),
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setEmoji('⏹')
      .setLabel('Stop & Clear Queue')
      .setStyle(ButtonStyle.Danger),
  );

  return [row1, row2, row3];
}

module.exports = { buildNowPlayingEmbed, buildMusicButtons };
