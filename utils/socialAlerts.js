const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'socials.json');

// socials.json structure:
// {
//   "guildId": {
//     "youtubeChannelId": {
//       "discordChannelId": "123",
//       "lastVideoId": "abc"
//     }
//   }
// }

function loadSocials() {
  if (!fs.existsSync(DATA_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch { return {}; }
}

function saveSocials(data) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function addYoutubeAlert(guildId, discordChannelId, youtubeChannelId) {
  const data = loadSocials();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][youtubeChannelId] = { discordChannelId, lastVideoId: null };
  saveSocials(data);
}

function removeYoutubeAlert(guildId, youtubeChannelId) {
  const data = loadSocials();
  if (data[guildId] && data[guildId][youtubeChannelId]) {
    delete data[guildId][youtubeChannelId];
    saveSocials(data);
  }
}

async function checkYoutube(client) {
  const data = loadSocials();
  let changed = false;

  for (const guildId of Object.keys(data)) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    for (const [ytChannelId, info] of Object.entries(data[guildId])) {
      try {
        const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ytChannelId}`);
        if (!res.ok) continue;
        const xml = await res.text();

        // Very basic regex parsing for speed & lightweight
        const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
        const authorMatch = xml.match(/<name>([^<]+)<\/name>/);

        if (videoIdMatch && titleMatch && authorMatch) {
          const latestVideoId = videoIdMatch[1];
          const title = titleMatch[1];
          const authorName = authorMatch[1];

          // If we have a new video
          if (info.lastVideoId !== latestVideoId) {
            
            // If it's not the very first time we check (where lastVideoId is null), send an alert
            if (info.lastVideoId !== null) {
              const discordChannel = guild.channels.cache.get(info.discordChannelId);
              if (discordChannel) {
                discordChannel.send(`🔔 **${authorName}** just uploaded a new video!\n\n**${title}**\nhttps://www.youtube.com/watch?v=${latestVideoId}`).catch(() => {});
              }
            }

            info.lastVideoId = latestVideoId;
            changed = true;
          }
        }
      } catch (err) {
        console.error(`[YouTube Alert Error] for ${ytChannelId}:`, err.message);
      }
    }
  }

  if (changed) saveSocials(data);
}

function startSocialAlerts(client) {
  // Check every 3 minutes
  setInterval(() => checkYoutube(client), 3 * 60 * 1000);
}

module.exports = {
  addYoutubeAlert,
  removeYoutubeAlert,
  startSocialAlerts
};
