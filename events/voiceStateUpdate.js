const xpManager = require('../utils/xpManager');

// Track when a user joins a voice channel: userId -> timestamp
const voiceSessions = new Map();

const { ChannelType, PermissionFlagsBits } = require('discord.js');
const tempChannels = new Set(); // Track temporary channels

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    if (newState.member.user.bot) return;

    const guildId = newState.guild.id;
    const userId = newState.member.id;
    const username = newState.member.user.username;

    const joinedChannel = !oldState.channelId && newState.channelId;
    const leftChannel = oldState.channelId && !newState.channelId;
    const movedChannel = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

    // --- Dynamic Voice Channels ---
    if (joinedChannel || movedChannel) {
      const channel = newState.channel;
      if (channel && (channel.name.includes('➕ Create Lounge') || channel.name.toLowerCase().includes('join to create'))) {
        try {
          const newChannel = await newState.guild.channels.create({
            name: `🔊 ${username}'s Lounge`,
            type: ChannelType.GuildVoice,
            parent: channel.parentId,
            permissionOverwrites: [
              { id: newState.guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
              { id: userId, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers, PermissionFlagsBits.MoveMembers] }
            ]
          });
          tempChannels.add(newChannel.id);
          await newState.member.voice.setChannel(newChannel);
        } catch (err) {
          console.error('Failed to create temp VC:', err);
        }
      }
    }

    if (leftChannel || movedChannel) {
      const oldChannel = oldState.channel;
      if (oldChannel && tempChannels.has(oldChannel.id) && oldChannel.members.size === 0) {
        try {
          await oldChannel.delete();
          tempChannels.delete(oldChannel.id);
        } catch (err) {
          console.error('Failed to delete empty temp VC:', err);
        }
      }
    }

    if (joinedChannel) {
      // User joined a voice channel
      voiceSessions.set(userId, Date.now());
    } 
    else if (leftChannel) {
      // User left a voice channel
      const joinTime = voiceSessions.get(userId);
      if (joinTime) {
        const timeSpentMs = Date.now() - joinTime;
        const minutes = Math.floor(timeSpentMs / 60000);
        
        if (minutes > 0) {
          const mongoose = require('mongoose');
          if (mongoose.connection.readyState === 1) {
            const result = await xpManager.addVoiceXp(guildId, userId, minutes);
            
            if (result.leveledUp) {
              let targetChannel = newState.guild.systemChannel;
              const { getGuildSettings } = require('../utils/settingsManager');
              const settings = await getGuildSettings(guildId);
              
              if (settings.levelChannel) {
                const customChannel = newState.guild.channels.cache.get(settings.levelChannel);
                if (customChannel) targetChannel = customChannel;
              }
              if (targetChannel) {
                targetChannel.send(`🎉 Congrats ${newState.member}! You just advanced to **Level ${result.newLevel}** from hanging out in voice chat!`).catch(() => {});
              }
            }
          }
        }
        voiceSessions.delete(userId);
      }
    }
    // --- AUDIT LOGGING ---
    const { sendLog } = require('../utils/logger');
    if (joinedChannel) {
      sendLog(newState.guild, 'Voice Channel Joined 🟢', `**User:** ${newState.member}\n**Channel:** ${newState.channel}`, '#22c55e', newState.member.user);
    } else if (leftChannel) {
      sendLog(oldState.guild, 'Voice Channel Left 🔴', `**User:** ${oldState.member}\n**Channel:** ${oldState.channel}`, '#ef4444', oldState.member.user);
    } else if (movedChannel) {
      sendLog(newState.guild, 'Voice Channel Moved 🔵', `**User:** ${newState.member}\n**From:** ${oldState.channel}\n**To:** ${newState.channel}`, '#3b82f6', newState.member.user);
    }

  },
};
