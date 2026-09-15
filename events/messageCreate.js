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

    // Increment message count
    xpManager.addMessage(guildId, userId);

    // Check cooldown (60 seconds)
    const now = Date.now();
    const lastGain = cooldowns.get(userId) || 0;
    if (now - lastGain < 60000) return;

    // Gain 15 to 25 XP
    const xpGained = Math.floor(Math.random() * 11) + 15;
    const result = xpManager.addXP(guildId, userId, message.author.username, xpGained);
    
    // Set new cooldown
    cooldowns.set(userId, now);

    // Announce level up
    if (result.levelUp) {
      let targetChannel = message.channel;
      const settings = require('../utils/settingsManager').getGuildSettings(guildId);
      
      if (settings.levelChannel) {
        const customChannel = message.guild.channels.cache.get(settings.levelChannel);
        if (customChannel) targetChannel = customChannel;
      }
      targetChannel.send(`🎉 Congrats ${message.author}! You just advanced to **Level ${result.newLevel}**!`).catch(() => {});

      // Auto-Role logic
      const configManager = require('../utils/configManager');
      const levelRewards = configManager.getLevelRewards(guildId);
      
      const levelKey = result.newLevel.toString();
      if (levelRewards[levelKey]) {
        const reward = levelRewards[levelKey];
        let role = message.guild.roles.cache.find(r => r.name === reward.roleName);
        
        if (!role) {
          role = await message.guild.roles.create({ 
            name: reward.roleName, 
            color: reward.color,
            reason: 'Auto-Role Level Reward'
          }).catch(() => null);
        }
        
        if (role) {
          await message.member.roles.add(role).catch(() => {});
          targetChannel.send(`🎖️ ${message.author} earned the **${reward.roleName}** role for reaching Level ${result.newLevel}!`).catch(() => {});
        }
      }
    }
  },
};
