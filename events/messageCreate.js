const xpManager = require('../utils/xpManager');

const cooldowns = new Map(); // userId -> timestamp

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return; // Ignore DMs

    const guildId = message.guild.id;
    const userId = message.author.id;

    // --- ADVANCED AUTO-MODERATION ---
    const { isModuleEnabled } = require('../utils/moduleGuard');
    if (isModuleEnabled(guildId, 'moderation') && !message.member.permissions.has('Administrator')) {
      const content = message.content.toLowerCase();
      
      // 1. Strict Anti-Scam Links (Nitro Phishing Regex)
      const scamRegex = /(discord-nitro\.|discord\.com\.free-nitro|steam-free\.|nitro-gift\.|discord-gift\.|discord\.app\.link|free-nitro\.|gift-nitro\.)/i;
      if (scamRegex.test(content)) {
        if (message.deletable) await message.delete().catch(() => {});
        const reply = await message.channel.send(`🛡️ **AutoMod**: ${message.author}'s message was deleted for containing a known scam/phishing link.`).catch(() => {});
        setTimeout(() => reply.delete().catch(() => {}), 8000);
        return; // Stop processing
      }

      // 2. Anti-Spam Logic (5 messages in 5 seconds)
      const spamMap = message.client.spamMap || new Map();
      if (!message.client.spamMap) message.client.spamMap = spamMap;

      const userSpamData = spamMap.get(userId) || { count: 0, lastMessage: Date.now() };
      
      if (Date.now() - userSpamData.lastMessage < 5000) {
        userSpamData.count++;
      } else {
        userSpamData.count = 1;
      }
      userSpamData.lastMessage = Date.now();
      spamMap.set(userId, userSpamData);

      if (userSpamData.count > 5) {
        // Mute user for 5 minutes
        if (message.deletable) await message.delete().catch(() => {});
        try {
          await message.member.timeout(5 * 60 * 1000, 'AutoMod: Rapid Spamming');
          await message.channel.send(`🛡️ **AutoMod**: ${message.author} has been timed out for 5 minutes for rapid spamming.`);
        } catch (err) {
          // Missing permissions to timeout
        }
        spamMap.delete(userId); // reset
        return;
      }
    }

    // --- XP PROCESSING ---
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return; // Skip if DB is disconnected

    const result = await xpManager.addMessageXp(guildId, userId, message.author.username);

    // Announce level up
    if (result.leveledUp) {
      let targetChannel = message.channel;
      const { getGuildSettings } = require('../utils/settingsManager');
      const settings = await getGuildSettings(guildId);
      
      if (settings.levelChannel) {
        const customChannel = message.guild.channels.cache.get(settings.levelChannel);
        if (customChannel) targetChannel = customChannel;
      }
      targetChannel.send(`💥 **BOOM!** Look who just stopped touching grass long enough to hit **Level ${result.newLevel}**! Congrats ${message.author}, keep up the grind! 🔥`).catch(() => {});

      // Auto-Role logic
      const configManager = require('../utils/configManager');
      const levelRewards = await configManager.getLevelRewards(guildId);
      
      const reward = levelRewards.find(r => r.level === result.newLevel);
      if (reward && reward.roleId) {
        const role = message.guild.roles.cache.get(reward.roleId);
        if (role) {
          await message.member.roles.add(role).catch(() => {});
          targetChannel.send(`👑 **SHEESH!** ${message.author} just leveled up and snatched the **${role.name}** role! Don't let the power go to your head! 😎`).catch(() => {});
        }
      }
    }
  },
};
