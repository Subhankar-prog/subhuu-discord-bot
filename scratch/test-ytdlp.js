const { YtDlpPlugin } = require('@distube/yt-dlp');
const { DisTube } = require('distube');
const { Client, GatewayIntentBits } = require('discord.js');

const plugin = new YtDlpPlugin({ update: true });

async function run() {
  console.log("Testing yt-dlp plugin resolution...");
  try {
    const result = await plugin.resolve("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    console.log("Resolved OK. Title:", result.name);
    console.log("Formats available?", result.formats ? result.formats.length : "No formats property");
  } catch (err) {
    console.error("Resolution failed:", err);
  }
}

run();
