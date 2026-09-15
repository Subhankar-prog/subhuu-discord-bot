const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Moderation commands (Requires Moderation Module to be enabled)')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option => option.setName('target').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for banning').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option => option.setName('target').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for kicking').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('timeout')
        .setDescription('Timeout (mute) a user')
        .addUserOption(option => option.setName('target').setDescription('The user to timeout').setRequired(true))
        .addIntegerOption(option => option.setName('minutes').setDescription('Duration in minutes').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for timeout').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Clear a specific number of messages')
        .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    ),
    
  async execute(interaction) {
    // Check if the moderation module is enabled for this server
    if (!isModuleEnabled(interaction.guildId, 'moderation')) {
      return interaction.reply({ 
        content: '❌ **Moderation Module is disabled.** An admin must enable it in the Web Dashboard to use these commands.', 
        ephemeral: true 
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'ban') {
      const target = interaction.options.getUser('target');
      const reason = interaction.options.getString('reason') ?? 'No reason provided';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);

      if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
      if (!member.bannable) return interaction.reply({ content: '❌ I do not have permission to ban this user.', ephemeral: true });

      await member.ban({ reason });
      await interaction.reply(`✅ Successfully banned **${target.tag}** for: *${reason}*`);
    }

    else if (subcommand === 'kick') {
      const target = interaction.options.getUser('target');
      const reason = interaction.options.getString('reason') ?? 'No reason provided';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);

      if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
      if (!member.kickable) return interaction.reply({ content: '❌ I do not have permission to kick this user.', ephemeral: true });

      await member.kick(reason);
      await interaction.reply(`✅ Successfully kicked **${target.tag}** for: *${reason}*`);
    }

    else if (subcommand === 'timeout') {
      const target = interaction.options.getUser('target');
      const minutes = interaction.options.getInteger('minutes');
      const reason = interaction.options.getString('reason') ?? 'No reason provided';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);

      if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
      if (!member.moderatable) return interaction.reply({ content: '❌ I do not have permission to timeout this user.', ephemeral: true });

      await member.timeout(minutes * 60 * 1000, reason);
      await interaction.reply(`✅ Successfully timed out **${target.tag}** for ${minutes} minutes. Reason: *${reason}*`);
    }

    else if (subcommand === 'clear') {
      const amount = interaction.options.getInteger('amount');
      await interaction.deferReply({ ephemeral: true });
      
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply(`✅ Successfully deleted ${deleted.size} messages.`);
    }
  },
};
