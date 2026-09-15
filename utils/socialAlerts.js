const Parser = require('rss-parser');
const parser = new Parser();
const { SocialAlert } = require('./database');

async function addYouTubeAlert(guildId, channelId, youtubeId) {
  const existing = await SocialAlert.findOne({ guildId, channelId, platform: 'youtube', accountId: youtubeId });
  if (existing) return false; // Already tracking

  const alert = new SocialAlert({
    guildId,
    channelId,
    platform: 'youtube',
    accountId: youtubeId,
    lastCheckedId: '' // We will set this on the first loop to prevent pinging old videos
  });
  await alert.save();
  return true;
}

async function checkYouTube(client) {
  const alerts = await SocialAlert.find({ platform: 'youtube' });
  if (!alerts.length) return;

  for (const alert of alerts) {
    try {
      const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${alert.accountId}`);
      if (!feed.items || feed.items.length === 0) continue;

      const latestVideo = feed.items[0];

      // If this is the first time checking, just save the ID and don't announce
      if (!alert.lastCheckedId) {
        alert.lastCheckedId = latestVideo.id;
        await alert.save();
        continue;
      }

      // If it's a new video
      if (latestVideo.id !== alert.lastCheckedId) {
        alert.lastCheckedId = latestVideo.id;
        await alert.save();

        const channel = await client.channels.fetch(alert.channelId).catch(() => null);
        if (channel) {
          channel.send(`🚨 **NEW UPLOAD!**\n**${feed.title}** just posted a new video!\n\n${latestVideo.link}`).catch(() => {});
        }
      }
    } catch (err) {
      console.error(`[SocialAlerts] Error fetching YouTube feed for ${alert.accountId}:`, err.message);
    }
  }
}

function initSocialAlerts(client) {
  // Check every 3 minutes
  setInterval(() => {
    checkYouTube(client);
  }, 3 * 60 * 1000);
}

module.exports = {
  addYouTubeAlert,
  initSocialAlerts
};
