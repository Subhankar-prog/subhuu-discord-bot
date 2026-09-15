const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const xpManager = require('../utils/xpManager');

// Helper to create a text progress bar
function createProgressBar(currentXP, nextLevelXP, length = 15) {
  const percent = Math.min(Math.max(currentXP / nextLevelXP, 0), 1);
  const filledCount = Math.round(percent * length);
  const emptyCount = length - filledCount;
  
  const filled = '█'.repeat(filledCount);
  const empty = '░'.repeat(emptyCount);
  return `${filled}${empty}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your XP, Level, and Rank')
    .addUserOption(opt => 
      opt.setName('user').setDescription('The user whose profile you want to view').setRequired(false)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const profile = xpManager.getProfile(interaction.guildId, targetUser.id);
    
    // We only have the username saved if they've spoken before.
    // Use the targetUser's display info as fallback.
    const displayAvatar = targetUser.displayAvatarURL({ size: 1024, dynamic: true });
    const displayName = profile.username || targetUser.username;

    const progressBar = createProgressBar(profile.xp - xpManager.getXPForLevel(profile.level), profile.nextLevelXP - xpManager.getXPForLevel(profile.level));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setAuthor({ name: `${displayName}'s Profile`, iconURL: displayAvatar })
      .setThumbnail(displayAvatar)
      .addFields(
        { name: '🏆 Rank', value: `#${profile.rank}`, inline: true },
        { name: '⭐ Level', value: `${profile.level}`, inline: true },
        { name: '✨ Total XP', value: `${profile.xp} XP`, inline: true },
        { name: '💬 Messages', value: `${profile.messages}`, inline: true },
        { name: `Progress to Level ${profile.level + 1}`, value: `**${profile.xp} / ${profile.nextLevelXP} XP**\n\`${progressBar}\``, inline: false }
      )
      .setFooter({ text: `Need ${profile.xpNeeded} more XP to level up!` });

    await interaction.reply({ embeds: [embed] });
  },
};
