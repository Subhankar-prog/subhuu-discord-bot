const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    // --- SUPPORT TICKETS ---
    if (interaction.customId === 'ticket_open') {
      if (!isModuleEnabled(interaction.guildId, 'tickets')) {
        return interaction.reply({ content: '❌ The Tickets module is currently disabled.', ephemeral: true });
      }

      const channelName = `ticket-${interaction.user.username.toLowerCase()}`;
      
      // Check if they already have a ticket
      const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
      if (existingChannel) {
        return interaction.reply({ content: `❌ You already have an open ticket: ${existingChannel}`, ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      try {
        const { getGuildSettings } = require('../utils/settingsManager');
        const settings = await getGuildSettings(interaction.guildId);
        const staffRoleId = settings?.ticketSettings?.staffRoleId || interaction.guild.roles.highest.id;

        const ticketChannel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: interaction.channel.parentId, // Create it in the same category
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel], // Hide from @everyone
            },
            {
              id: interaction.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], // Let user see
            },
            {
              // Give admin access or specific support role
              id: staffRoleId, 
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            }
          ],
        });

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Support Ticket')
          .setDescription(`Welcome ${interaction.user}! Please describe your issue and a staff member will be with you shortly.`);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
        );

        await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
        await interaction.editReply(`✅ Ticket created: ${ticketChannel}`);
      } catch (err) {
        console.error(err);
        await interaction.editReply('❌ Failed to create ticket channel. Check my permissions!');
      }
    }

    else if (interaction.customId === 'ticket_close') {
      const { getGuildSettings } = require('../utils/settingsManager');
      const settings = await getGuildSettings(interaction.guildId);
      const staffRoleId = settings?.ticketSettings?.staffRoleId;
      
      const isStaff = staffRoleId && interaction.member.roles.cache.has(staffRoleId);
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

      if (!isStaff && !isAdmin) {
        return interaction.reply({ content: '❌ Only staff can close tickets.', ephemeral: true });
      }
      await interaction.reply('🔒 Closing ticket in 3 seconds...');
      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }

    // --- REACTION ROLES ---
    else if (interaction.customId.startsWith('rr_')) {
      const roleId = interaction.customId.split('_')[1];
      const role = interaction.guild.roles.cache.get(roleId);
      
      if (!role) {
        return interaction.reply({ content: '❌ This role no longer exists.', ephemeral: true });
      }

      try {
        if (interaction.member.roles.cache.has(roleId)) {
          await interaction.member.roles.remove(roleId);
          await interaction.reply({ content: `➖ Removed the **${role.name}** role.`, ephemeral: true });
        } else {
          await interaction.member.roles.add(roleId);
          await interaction.reply({ content: `➕ Added the **${role.name}** role!`, ephemeral: true });
        }
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Failed to update role. I might not have permission (my bot role must be higher than the role I am assigning).', ephemeral: true });
      }
    }

    // --- BLACKJACK ---
    else if (interaction.customId === 'bj_hit' || interaction.customId === 'bj_stand') {
      const msgId = interaction.message.id;
      if (!global.activeBlackjackGames || !global.activeBlackjackGames.has(msgId)) {
        return interaction.reply({ content: '❌ This game has ended or expired.', ephemeral: true });
      }

      const game = global.activeBlackjackGames.get(msgId);
      if (interaction.user.id !== game.userId) {
        return interaction.reply({ content: '❌ This is not your game!', ephemeral: true });
      }

      const economy = require('../utils/economyManager');
      const { EmbedBuilder } = require('discord.js');

      if (interaction.customId === 'bj_hit') {
        // Player draws
        game.playerHand.push(game.deck.pop());
        const pScore = game.calculateScore(game.playerHand);

        if (pScore > 21) {
          // Bust
          global.activeBlackjackGames.delete(msgId);
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🃏 Blackjack - BUST!')
            .setDescription(`**Your Hand:** ${game.playerHand.map(c => c.value + c.suit).join(' ')} (Score: ${pScore})\n**Dealer's Hand:** ${game.dealerHand.map(c => c.value + c.suit).join(' ')} (Score: ${game.calculateScore(game.dealerHand)})\n\n💀 **YOU BUSTED!** You lost **${game.bet}** coins.`);
          return interaction.update({ embeds: [embed], components: [] });
        } else {
          // Safe hit, update embed
          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🃏 Blackjack')
            .setDescription(`**Your Hand:** ${game.playerHand.map(c => c.value + c.suit).join(' ')} (Score: ${pScore})\n**Dealer's Hand:** ${game.dealerHand[0].value}${game.dealerHand[0].suit} ❓ (Score: ?)`);
          return interaction.update({ embeds: [embed] });
        }
      }

      if (interaction.customId === 'bj_stand') {
        // Dealer plays
        global.activeBlackjackGames.delete(msgId);
        
        let dScore = game.calculateScore(game.dealerHand);
        while (dScore < 17) {
          game.dealerHand.push(game.deck.pop());
          dScore = game.calculateScore(game.dealerHand);
        }

        const pScore = game.calculateScore(game.playerHand);
        let resultMsg = '';
        let color = '';

        if (dScore > 21 || pScore > dScore) {
          // Player wins
          economy.addCoins(game.guildId, game.userId, game.bet * 2);
          resultMsg = `🎉 **YOU WON!** You gained **${game.bet}** coins!`;
          color = '#00ff00';
        } else if (pScore === dScore) {
          // Push (Tie)
          economy.addCoins(game.guildId, game.userId, game.bet); // return bet
          resultMsg = `🤝 **PUSH!** It's a tie. You got your bet back.`;
          color = '#aaaaaa';
        } else {
          // Dealer wins
          resultMsg = `💀 **DEALER WINS!** You lost **${game.bet}** coins.`;
          color = '#ff0000';
        }

        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle('🃏 Blackjack - Game Over')
          .setDescription(`**Your Hand:** ${game.playerHand.map(c => c.value + c.suit).join(' ')} (Score: ${pScore})\n**Dealer's Hand:** ${game.dealerHand.map(c => c.value + c.suit).join(' ')} (Score: ${dScore})\n\n${resultMsg}`);
        
        return interaction.update({ embeds: [embed], components: [] });
      }
    }

    // --- GIVEAWAYS ---
    else if (interaction.customId === 'gw_enter') {
      if (!isModuleEnabled(interaction.guildId, 'giveaways')) {
        return interaction.reply({ content: '❌ The Giveaways module is currently disabled.', ephemeral: true });
      }

      const messageId = interaction.message.id;
      if (!global.activeGiveaways || !global.activeGiveaways.has(messageId)) {
        return interaction.reply({ content: '❌ This giveaway has ended or is invalid.', ephemeral: true });
      }

      const entrants = global.activeGiveaways.get(messageId);
      
      if (entrants.has(interaction.user.id)) {
        // They already entered, let them leave
        entrants.delete(interaction.user.id);
        await interaction.reply({ content: '🚪 You left the giveaway.', ephemeral: true });
      } else {
        // Enter
        entrants.add(interaction.user.id);
        await interaction.reply({ content: '🎉 You entered the giveaway! Good luck!', ephemeral: true });
      }

      // Update the embed footer with new count
      const embed = EmbedBuilder.from(interaction.message.embeds[0]);
      embed.setFooter({ text: `${entrants.size} entries so far` });
      await interaction.message.edit({ embeds: [embed] }).catch(() => {});
    }
  },
};
