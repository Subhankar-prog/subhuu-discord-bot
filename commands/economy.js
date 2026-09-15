const { SlashCommandBuilder } = require('discord.js');
const { isModuleEnabled } = require('../utils/moduleGuard');
const economy = require('../utils/economyManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Economy system commands (Requires Economy module)')
    .addSubcommand(sub => 
      sub
        .setName('balance')
        .setDescription('Check your coin balance')
        .addUserOption(opt => opt.setName('user').setDescription('Check someone else\'s balance').setRequired(false))
    )
    .addSubcommand(sub => 
      sub
        .setName('daily')
        .setDescription('Claim your daily free coins')
    )
    .addSubcommand(sub => 
      sub
        .setName('pay')
        .setDescription('Give coins to another user')
        .addUserOption(opt => opt.setName('user').setDescription('The user to pay').setRequired(true))
        .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to pay').setRequired(true).setMinValue(1))
    )
    .addSubcommand(sub => 
      sub
        .setName('coinflip')
        .setDescription('Gamble your coins! Double or nothing.')
        .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(1))
        .addStringOption(opt => 
          opt.setName('choice')
          .setDescription('Heads or Tails?')
          .setRequired(true)
          .addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' })
        )
    )
    .addSubcommand(sub => 
      sub
        .setName('slots')
        .setDescription('Play the slot machine!')
        .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(1))
    )
    .addSubcommand(sub => 
      sub
        .setName('blackjack')
        .setDescription('Play a hand of Blackjack (21) against the dealer.')
        .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(1))
    ),

  async execute(interaction) {
    if (!(await isModuleEnabled(interaction.guildId, 'economy'))) {
      return interaction.reply({ 
        content: '❌ **Economy Module is disabled.** Enable it in the Web Dashboard first.', 
        ephemeral: true 
      });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    if (sub === 'balance') {
      const target = interaction.options.getUser('user') || interaction.user;
      const bal = await economy.getBalance(guildId, target.id);
      return interaction.reply(`💰 **${target.username}** has **${bal}** coins.`);
    }

    else if (sub === 'daily') {
      const result = await economy.claimDaily(guildId, userId);
      if (!result.success) {
        const hours = Math.floor(result.timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((result.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        return interaction.reply({ content: `⏳ You already claimed your daily! Come back in **${hours}h ${minutes}m**.`, ephemeral: true });
      }
      return interaction.reply(`🎁 You claimed your daily **${result.reward}** coins! Your new balance is **${result.newBalance}** coins.`);
    }

    else if (sub === 'pay') {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      
      if (target.id === userId) return interaction.reply({ content: '❌ You cannot pay yourself!', ephemeral: true });
      if (target.bot) return interaction.reply({ content: '❌ You cannot pay a bot!', ephemeral: true });

      const success = await economy.removeCoins(guildId, userId, amount);
      if (!success) return interaction.reply({ content: '❌ You do not have enough coins!', ephemeral: true });

      await economy.addCoins(guildId, target.id, amount);
      return interaction.reply(`💸 You paid **${amount}** coins to ${target}.`);
    }

    else if (sub === 'coinflip') {
      const bet = interaction.options.getInteger('bet');
      const choice = interaction.options.getString('choice');

      const bal = await economy.getBalance(guildId, userId);
      if (bal < bet) {
        return interaction.reply({ content: '❌ You do not have enough coins to make that bet!', ephemeral: true });
      }

      // 50/50 chance
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = choice === result;

      if (won) {
        await economy.addCoins(guildId, userId, bet); // Give them their winnings
        return interaction.reply(`🪙 The coin landed on **${result}**!\n🎉 **YOU WON!** You gained **${bet}** coins. New balance: **${bal + bet}**.`);
      } else {
        await economy.removeCoins(guildId, userId, bet); // Take away their bet
        return interaction.reply(`🪙 The coin landed on **${result}**...\n💀 **YOU LOST!** You lost **${bet}** coins. New balance: **${bal - bet}**.`);
      }
    }

    else if (sub === 'slots') {
      const bet = interaction.options.getInteger('bet');
      const bal = await economy.getBalance(guildId, userId);
      
      if (bal < bet) {
        return interaction.reply({ content: '❌ You do not have enough coins to make that bet!', ephemeral: true });
      }

      const emojis = ['🍒', '🍋', '💎', '🍉', '🔔', '⭐'];
      const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
      const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
      const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

      let winAmount = 0;
      let msg = '';

      if (slot1 === slot2 && slot2 === slot3) {
        winAmount = bet * 10;
        await economy.addCoins(guildId, userId, winAmount);
        msg = `🎉 **JACKPOT!!!** You won **${winAmount}** coins!`;
      } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
        winAmount = bet * 2;
        await economy.addCoins(guildId, userId, winAmount);
        msg = `🎊 **WIN!** You doubled your bet and won **${winAmount}** coins!`;
      } else {
        await economy.removeCoins(guildId, userId, bet);
        msg = `💀 **LOSE!** You lost **${bet}** coins.`;
      }

      const newBal = await economy.getBalance(guildId, userId);
      
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setColor(winAmount > 0 ? '#00ff00' : '#ff0000')
        .setTitle('🎰 Slot Machine')
        .setDescription(`
**[ ${slot1} | ${slot2} | ${slot3} ]**

${msg}
*New balance: **${newBal}***
        `);

      return interaction.reply({ embeds: [embed] });
    }

    else if (sub === 'blackjack') {
      const bet = interaction.options.getInteger('bet');
      const bal = await economy.getBalance(guildId, userId);
      
      if (bal < bet) {
        return interaction.reply({ content: '❌ You do not have enough coins to make that bet!', ephemeral: true });
      }

      // We need to take the bet immediately to prevent spamming
      await economy.removeCoins(guildId, userId, bet);

      // Create Deck
      const suits = ['♠️', '♥️', '♦️', '♣️'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      let deck = [];
      for (const suit of suits) {
        for (const value of values) {
          deck.push({ suit, value });
        }
      }
      // Shuffle
      deck = deck.sort(() => Math.random() - 0.5);

      const drawCard = () => deck.pop();
      const calculateScore = (hand) => {
        let score = 0;
        let aces = 0;
        for (const card of hand) {
          if (['J', 'Q', 'K'].includes(card.value)) score += 10;
          else if (card.value === 'A') { score += 11; aces += 1; }
          else score += parseInt(card.value);
        }
        while (score > 21 && aces > 0) {
          score -= 10;
          aces -= 1;
        }
        return score;
      };

      const playerHand = [drawCard(), drawCard()];
      const dealerHand = [drawCard(), drawCard()];
      const playerScore = calculateScore(playerHand);

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      
      // We store global state for interactionCreate to pick up
      if (!global.activeBlackjackGames) global.activeBlackjackGames = new Map();

      // Check instant blackjack
      if (playerScore === 21) {
        const winAmount = Math.floor(bet * 2.5); // 3:2 payout for instant blackjack
        await economy.addCoins(guildId, userId, winAmount + bet);
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🃏 Blackjack - YOU WON!')
          .setDescription(`**Your Hand:** ${playerHand.map(c => c.value + c.suit).join(' ')} (Score: 21)\n**Dealer's Hand:** ${dealerHand.map(c => c.value + c.suit).join(' ')} (Score: ${calculateScore(dealerHand)})\n\n🎉 **BLACKJACK!** You won **${winAmount}** coins!`);
        return interaction.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🃏 Blackjack')
        .setDescription(`**Your Hand:** ${playerHand.map(c => c.value + c.suit).join(' ')} (Score: ${playerScore})\n**Dealer's Hand:** ${dealerHand[0].value}${dealerHand[0].suit} ❓ (Score: ?)`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`bj_hit`).setLabel('Hit').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`bj_stand`).setLabel('Stand').setStyle(ButtonStyle.Secondary)
      );

      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      global.activeBlackjackGames.set(msg.id, {
        userId,
        guildId,
        bet,
        deck,
        playerHand,
        dealerHand,
        calculateScore
      });

      // Cleanup after 2 mins if abandoned
      setTimeout(() => {
        if (global.activeBlackjackGames.has(msg.id)) {
          global.activeBlackjackGames.delete(msg.id);
          embed.setTitle('🃏 Blackjack - Game Cancelled').setColor('#ff0000');
          interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
        }
      }, 120000);
    }
  },
};
