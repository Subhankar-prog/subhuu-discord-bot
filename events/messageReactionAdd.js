// events/messageReactionAdd.js — Handles Reaction Role assignments
const { ReactionRole } = require('../utils/database');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (user.bot) return;

    // Fetch partial reactions
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }

    const guild = reaction.message.guild;
    if (!guild) return;

    // Normalize emoji identifier
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

      await member.roles.add(role).catch(() => {});
      console.log(`[ReactionRoles] Gave role "${role.name}" to ${user.tag}`);
    } catch (err) {
      console.error('[ReactionRoles] Error on add:', err);
    }
  }
};
