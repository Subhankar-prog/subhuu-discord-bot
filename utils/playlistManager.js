const { Playlist } = require('./database');

async function savePlaylist(userId, playlistName, songs) {
  let playlist = await Playlist.findOne({ userId, playlistName });
  if (!playlist) {
    playlist = new Playlist({ userId, playlistName, songs });
  } else {
    playlist.songs = songs;
  }
  await playlist.save();
}

async function loadPlaylist(userId, playlistName) {
  const playlist = await Playlist.findOne({ userId, playlistName });
  return playlist ? playlist.songs : null;
}

async function listPlaylists(userId) {
  const playlists = await Playlist.find({ userId });
  return playlists.map(p => p.playlistName);
}

module.exports = {
  savePlaylist,
  loadPlaylist,
  listPlaylists
};
