const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const xpManager = require('../utils/xpManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 10 most active members in the server'),
  async execute(interaction) {
    const topUsers = await xpManager.getLeaderboard(interaction.guildId);

    if (topUsers.length === 0) {
      return interaction.reply({ content: 'No one has gained any XP yet! Start chatting to claim #1.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700) // Gold
      .setTitle(`🏆 Server Leaderboard`)
      .setDescription(
        topUsers.map((user, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
          return `${medal} **${user.username || `<@${user.userId}>`}** — Lvl ${user.level} (${user.xp} XP)`;
        }).join('\n\n')
      )
      .setFooter({ text: 'Gain XP by chatting or sitting in voice channels!' });

    await interaction.reply({ embeds: [embed] });
  },
};
