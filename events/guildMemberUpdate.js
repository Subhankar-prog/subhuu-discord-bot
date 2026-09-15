const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    if (newMember.user.bot) return;

    // Track Nickname changes
    if (oldMember.nickname !== newMember.nickname) {
      const oldNick = oldMember.nickname || oldMember.user.username;
      const newNick = newMember.nickname || newMember.user.username;
      
      sendLog(
        newMember.guild, 
        'Nickname Changed 🟡', 
        `**User:** ${newMember}\n**Old:** ${oldNick}\n**New:** ${newNick}`, 
        '#eab308', 
        newMember.user
      );
    }

    // Track Role changes
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
      const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
      const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

      if (addedRoles.size > 0) {
        sendLog(
          newMember.guild, 
          'Role Added 🟡', 
          `**User:** ${newMember}\n**Role:** ${addedRoles.map(r => r.toString()).join(', ')}`, 
          '#eab308', 
          newMember.user
        );
      }

      if (removedRoles.size > 0) {
        sendLog(
          newMember.guild, 
          'Role Removed 🟡', 
          `**User:** ${newMember}\n**Role:** ${removedRoles.map(r => r.toString()).join(', ')}`, 
          '#eab308', 
          newMember.user
        );
      }
    }
  },
};
