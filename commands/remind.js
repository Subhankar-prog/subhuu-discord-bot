const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');
const reminderManager = require('../utils/reminderManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption(opt => 
      opt.setName('time')
        .setDescription('When to remind you (e.g. 10m, 1h, 2d)')
        .setRequired(true)
    )
    .addStringOption(opt => 
      opt.setName('message')
        .setDescription('What to remind you about')
        .setRequired(true)
    ),

  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const message = interaction.options.getString('message');

    const duration = ms(timeStr);
    if (!duration) {
      return interaction.reply({ content: '❌ Invalid time format! Use something like `10m`, `1h`, or `2d`.', ephemeral: true });
    }

    if (duration > ms('30d')) {
      return interaction.reply({ content: '❌ Reminders cannot be set for more than 30 days in advance.', ephemeral: true });
    }

    const endTime = Date.now() + duration;

    reminderManager.addReminder(interaction.user.id, interaction.channelId, message, endTime);

    interaction.reply(`✅ I will remind you about **"${message}"** in **${ms(duration, { long: true })}**!`);
  }
};
