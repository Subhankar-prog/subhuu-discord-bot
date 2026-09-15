/**
 * playlistManager.js
 * CRUD helpers for per-user, per-guild saved playlists.
 * Data is persisted to data/playlists.json.
 *
 * Schema:
 * {
 *   "<guildId>": {
 *     "<userId>": {
 *       "<PlaylistName>": [{ name: string, url: string }, ...]
 *     }
 *   }
 * }
 */

const fs   = require('fs');
const path = require('path');

const DATA_PATH    = path.join(__dirname, '..', 'data', 'playlists.json');
const MAX_SONGS    = 100;
const MAX_PLAYLISTS = 20;

// ---- I/O ----------------------------------------------------------------

function load() {
  if (!fs.existsSync(DATA_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
  catch { return {}; }
}

function save(data) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ---- Helpers ------------------------------------------------------------

/** Returns the exact stored playlist key matching name (case-insensitive), or null. */
function findKey(playlists, name) {
  return Object.keys(playlists).find(k => k.toLowerCase() === name.toLowerCase()) ?? null;
}

// ---- Public API ---------------------------------------------------------

function getUserPlaylists(guildId, userId) {
  const data = load();
  return data?.[guildId]?.[userId] ?? {};
}

function getPlaylist(guildId, userId, name) {
  const playlists = getUserPlaylists(guildId, userId);
  const key = findKey(playlists, name);
  if (!key) return null;
  return { key, songs: playlists[key] };
}

function createPlaylist(guildId, userId, name) {
  const data = load();
  data[guildId]          ??= {};
  data[guildId][userId]  ??= {};
  const playlists = data[guildId][userId];

  if (Object.keys(playlists).length >= MAX_PLAYLISTS)
    return { error: `You can have at most **${MAX_PLAYLISTS}** playlists.` };
  if (playlists[name])
    return { error: `A playlist named **${name}** already exists.` };

  playlists[name] = [];
  save(data);
  return { ok: true };
}

function addSong(guildId, userId, playlistName, song) {
  const data = load();
  const playlists = data?.[guildId]?.[userId];
  if (!playlists) return { error: 'You have no playlists. Create one first with `/playlist create`.' };

  const key = findKey(playlists, playlistName);
  if (!key) return { error: `Playlist **${playlistName}** not found.` };
  if (playlists[key].length >= MAX_SONGS)
    return { error: `Playlist is full (max ${MAX_SONGS} songs).` };
  if (playlists[key].some(s => s.url === song.url))
    return { error: 'That song is already in the playlist.' };

  playlists[key].push(song);
  save(data);
  return { ok: true };
}

/**
 * Bulk-add songs (for playlist import). Skips duplicates.
 * Returns { ok, added, skipped } or { error }.
 */
function addSongs(guildId, userId, playlistName, songs) {
  const data = load();
  data[guildId]         ??= {};
  data[guildId][userId] ??= {};
  const playlists = data[guildId][userId];

  const key = findKey(playlists, playlistName);
  if (!key) return { error: `Playlist **${playlistName}** not found.` };

  const available = MAX_SONGS - playlists[key].length;
  if (available <= 0) return { error: `Playlist is full (max ${MAX_SONGS} songs).` };

  const candidates = songs.slice(0, available);
  const fresh      = candidates.filter(s => !playlists[key].some(e => e.url === s.url));
  playlists[key].push(...fresh);
  save(data);
  return { ok: true, added: fresh.length, skipped: songs.length - fresh.length };
}

function removeSong(guildId, userId, playlistName, index1Based) {
  const data = load();
  const playlists = data?.[guildId]?.[userId];
  if (!playlists) return { error: 'You have no playlists.' };

  const key = findKey(playlists, playlistName);
  if (!key) return { error: `Playlist **${playlistName}** not found.` };

  const len = playlists[key].length;
  if (index1Based < 1 || index1Based > len)
    return { error: `Invalid index. Use a number between 1 and ${len}.` };

  const [removed] = playlists[key].splice(index1Based - 1, 1);
  save(data);
  return { ok: true, removed };
}

function deletePlaylist(guildId, userId, name) {
  const data = load();
  const playlists = data?.[guildId]?.[userId];
  if (!playlists) return { error: 'You have no playlists.' };

  const key = findKey(playlists, name);
  if (!key) return { error: `Playlist **${name}** not found.` };

  delete playlists[key];
  save(data);
  return { ok: true };
}

module.exports = {
  getUserPlaylists,
  getPlaylist,
  createPlaylist,
  addSong,
  addSongs,
  removeSong,
  deletePlaylist,
  MAX_SONGS,
  MAX_PLAYLISTS,
};
