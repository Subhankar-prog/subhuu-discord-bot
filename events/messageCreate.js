// events/messageCreate.js — XP, Custom Commands, Word Filter, Anti-Spam, Anti-Scam
const xpManager = require('../utils/xpManager');
const { CustomCommand, ActionLog } = require('../utils/database');
const { getGuildSettings } = require('../utils/settingsManager');

const spamMap = new Map(); // userId -> { count, lastMessage }

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const content = message.content;
    const lowerContent = content.toLowerCase();

    // --- LOAD SETTINGS ---
    const mongoose = require('mongoose');
    const dbReady = mongoose.connection.readyState === 1;
    let settings = null;
    if (dbReady) {
      settings = await getGuildSettings(guildId);
    }

    const isAdmin = message.member?.permissions.has('Administrator');

    // =========================================================
    //  AUTOMOD (only for non-admins)
    // =========================================================
    if (!isAdmin && settings) {
      const automod = settings.automodSettings || {};

      // 1. Anti-Scam Links
      if (automod.antiScamLinks !== false) {
        const scamRegex = /(discord-nitro\.|discord\.com\.free-nitro|steam-free\.|nitro-gift\.|discord-gift\.|free-nitro\.|gift-nitro\.)/i;
        if (scamRegex.test(lowerContent)) {
          if (message.deletable) await message.delete().catch(() => {});
          const r = await message.channel.send(`🛡️ **AutoMod**: ${message.author}'s message was removed — known scam/phishing link detected.`).catch(() => {});
          if (r) setTimeout(() => r.delete().catch(() => {}), 8000);
          await _log(guildId, 'automod', '🛡️ Scam Link Detected', `${message.author.tag} sent a scam link in <#${message.channelId}>`, userId, message.author.tag);
          return;
        }
      }

      // 2. Word Filter
      if (automod.filterWords && automod.filterWords.length > 0) {
        const matched = automod.filterWords.find(w => lowerContent.includes(w.toLowerCase()));
        if (matched) {
          if (message.deletable) await message.delete().catch(() => {});
          const r = await message.channel.send(`🛡️ **AutoMod**: ${message.author}'s message was removed — filtered word detected.`).catch(() => {});
          if (r) setTimeout(() => r.delete().catch(() => {}), 5000);
          await _log(guildId, 'automod', '🛡️ Word Filter Triggered', `${message.author.tag} used a filtered word in <#${message.channelId}>`, userId, message.author.tag);
          return;
        }
      }

      // 3. Anti-Spam
      if (automod.antiSpam) {
        const threshold = automod.spamThreshold || 5;
        const userSpam = spamMap.get(userId) || { count: 0, lastMessage: 0 };
        if (Date.now() - userSpam.lastMessage < 5000) {
          userSpam.count++;
        } else {
          userSpam.count = 1;
        }
        userSpam.lastMessage = Date.now();
        spamMap.set(userId, userSpam);

        if (userSpam.count > threshold) {
          if (message.deletable) await message.delete().catch(() => {});
          try {
            await message.member.timeout(5 * 60 * 1000, 'AutoMod: Spam');
            await message.channel.send(`🛡️ **AutoMod**: ${message.author} timed out 5 min for spamming.`);
          } catch {}
          spamMap.delete(userId);
          await _log(guildId, 'automod', '🛡️ Spam Detected', `${message.author.tag} was timed out for spamming in <#${message.channelId}>`, userId, message.author.tag);
          return;
        }
      }
    }

    // =========================================================
    //  CUSTOM COMMANDS
    // =========================================================
    if (dbReady && settings?.modules?.customCommands) {
      try {
        const cmd = await CustomCommand.findOne({ guildId, trigger: { $regex: new RegExp(`^${_escapeRegex(lowerContent.trim())}$`, 'i') } });
        if (cmd) {
          let resp = cmd.response
            .replace(/{user}/g, message.author.toString())
            .replace(/{username}/g, message.author.username)
            .replace(/{server}/g, message.guild.name);
          await message.reply(resp).catch(() => {});
          return;
        }
      } catch {}
    }

    // =========================================================
    //  XP PROCESSING
    // =========================================================
    if (!dbReady) return;

    // Check no-XP channels/roles
    if (settings?.xpSettings?.noXpChannels?.includes(message.channelId)) return;
    if (message.member?.roles.cache.some(r => settings?.xpSettings?.noXpRoles?.includes(r.id))) return;

    const result = await xpManager.addMessageXp(guildId, userId, message.author.username);

    if (result.leveledUp) {
      let targetChannel = message.channel;
      if (settings?.levelChannel) {
        const ch = message.guild.channels.cache.get(settings.levelChannel);
        if (ch) targetChannel = ch;
      }

      const lvlMsg = (settings?.xpSettings?.levelUpMessage || 'Congrats {user}! You reached level {level}!')
        .replace(/{user}/g, message.author.toString())
        .replace(/{level}/g, result.newLevel)
        .replace(/{username}/g, message.author.username);

      targetChannel.send(`💥 **BOOM!** ${lvlMsg} 🔥`).catch(() => {});

      // Level rewards
      const configManager = require('../utils/configManager');
      const levelRewards = await configManager.getLevelRewards(guildId);
      const reward = levelRewards.find(r => r.level === result.newLevel);
      if (reward?.roleId) {
        const role = message.guild.roles.cache.get(reward.roleId);
        if (role) {
          await message.member.roles.add(role).catch(() => {});
          targetChannel.send(`👑 **SHEESH!** ${message.author} unlocked **${role.name}**! Don't let the power go to your head! 😎`).catch(() => {});
        }
      }
    }
  }
};

function _escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function _log(guildId, type, title, description, userId, username) {
  try {
    await ActionLog.create({ guildId, type, title, description, userId, username });
  } catch {}
}
