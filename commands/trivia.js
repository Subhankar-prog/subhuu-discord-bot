const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

// Decodes HTML entities that the Open Trivia DB API returns (e.g. &quot; &#039;)
function decodeHtml(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ldquo;|&rdquo;/g, '"');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Play a round of trivia'),
  async execute(interaction) {
    await interaction.deferReply();

    const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
    const data = await res.json();
    if (!data.results?.length) {
      return interaction.editReply('Could not fetch a trivia question right now, try again.');
    }

    const q = data.results[0];
    const question = decodeHtml(q.question);
    const correct = decodeHtml(q.correct_answer);
    const options = shuffle([...q.incorrect_answers.map(decodeHtml), correct]);

    const row = new ActionRowBuilder().addComponents(
      options.map((opt, i) =>
        new ButtonBuilder().setCustomId(`trivia_${i}`).setLabel(opt.slice(0, 80)).setStyle(ButtonStyle.Secondary)
      )
    );

    const embed = new EmbedBuilder()
      .setTitle(`Trivia — ${decodeHtml(q.category)} (${q.difficulty})`)
      .setDescription(question)
      .setColor(0xf1c40f);

    const message = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = message.createMessageComponentCollector({ time: 20_000 });
    let answered = false;

    collector.on('collect', async btn => {
      answered = true;
      const chosen = options[Number(btn.customId.split('_')[1])];
      const isCorrect = chosen === correct;
      await btn.update({
        content: isCorrect
          ? `✅ ${btn.user} got it — the answer was **${correct}**!`
          : `❌ ${btn.user} picked **${chosen}**. The correct answer was **${correct}**.`,
        embeds: [embed],
        components: [],
      });
      collector.stop();
    });

    collector.on('end', async () => {
      if (!answered) {
        await interaction.editReply({
          content: `⏰ Time's up! The correct answer was **${correct}**.`,
          embeds: [embed],
          components: [],
        });
      }
    });
  },
};
