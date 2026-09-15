const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

// Import the shared state from listen.js (we'll export it there)
const { activeLoops } = require('./listen');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stoplisten')
    .setDescription('Stops the active continuous voice conversation loop'),
  async execute(interaction, client) {
    const guildId = interaction.guildId;
    
    if (activeLoops && activeLoops.has(guildId)) {
      activeLoops.set(guildId, false); // Tell the loop to stop on next tick
      await interaction.reply('🛑 The voice conversation loop will stop after the current thought finishes.');
      
      // If DisTube isn't playing, we should disconnect the voice connection.
      const queue = client.distube.getQueue(guildId);
      if (!queue) {
        const connection = getVoiceConnection(guildId);
        if (connection) connection.destroy();
      }
    } else {
      await interaction.reply({ content: '❌ There is no active conversation loop to stop.', ephemeral: true });
    }
  },
};
