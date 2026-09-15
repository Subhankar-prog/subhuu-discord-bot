const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check if the bot is alive'),
  async execute(interaction, client) {
    const roundtrip = Date.now() - interaction.createdTimestamp;
    const websocket = client.ws.ping;
    await interaction.reply(`🏓 **Pong!**\n📡 **Roundtrip Latency:** ${roundtrip}ms\n🌐 **Discord API (WebSocket):** ${websocket}ms`);
  },
};
