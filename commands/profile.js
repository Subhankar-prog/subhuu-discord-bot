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
    
    const user = await xpManager.ensureUser(interaction.guildId, targetUser.id);
    const rank = await xpManager.getRank(interaction.guildId, targetUser.id);
    
    const currentLevelXp = xpManager.calculateRequiredXp(user.level);
    const nextLevelXP = xpManager.calculateRequiredXp(user.level + 1);
    
    const displayAvatar = targetUser.displayAvatarURL({ size: 1024, dynamic: true });
    const displayName = user.username && user.username !== 'Unknown' ? user.username : targetUser.username;

    const progressBar = createProgressBar(user.xp - currentLevelXp, nextLevelXP - currentLevelXp);
    const xpNeeded = nextLevelXP - user.xp;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setAuthor({ name: `${displayName}'s Profile`, iconURL: displayAvatar })
      .setThumbnail(displayAvatar)
      .addFields(
        { name: '🏆 Rank', value: `#${rank}`, inline: true },
        { name: '⭐ Level', value: `${user.level}`, inline: true },
        { name: '✨ Total XP', value: `${user.xp} XP`, inline: true },
        { name: `Progress to Level ${user.level + 1}`, value: `**${user.xp} / ${nextLevelXP} XP**\n\`${progressBar}\``, inline: false }
      )
      .setFooter({ text: `Need ${xpNeeded} more XP to level up!` });

    await interaction.reply({ embeds: [embed] });
  },
};
