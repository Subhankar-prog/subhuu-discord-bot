// events/messageReactionRemove.js — Handles Reaction Role removals
const { ReactionRole } = require('../utils/database');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }

    const guild = reaction.message.guild;
    if (!guild) return;

    const emoji = reaction.emoji.id
      ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
      : reaction.emoji.name;

    try {
      const rr = await ReactionRole.findOne({
        guildId: guild.id,
        messageId: reaction.message.id,
        emoji
      });
      if (!rr) return;

      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const role = guild.roles.cache.get(rr.roleId);
      if (!role) return;

      await member.roles.remove(role).catch(() => {});
      console.log(`[ReactionRoles] Removed role "${role.name}" from ${user.tag}`);
    } catch (err) {
      console.error('[ReactionRoles] Error on remove:', err);
    }
  }
};
