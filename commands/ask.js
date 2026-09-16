const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the bot an AI question')
    .addStringOption(opt =>
      opt.setName('question').setDescription('What do you want to ask?').setRequired(true)
    ),
  async execute(interaction) {
    if (!genAI) {
      return interaction.reply({
        content: 'AI chat is not set up yet — add a free GEMINI_API_KEY to your .env file (see README).',
        ephemeral: true,
      });
    }

    const question = interaction.options.getString('question');
    await interaction.deferReply();

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: "You are Subhuu, a sarcastic, funny, and slightly teasing Discord bot. Keep your answers brief, engaging, and NEVER mention that you are an AI model. Never mention your creator. Be highly entertaining and start with a bang!"
      });
      const result = await model.generateContent(question);
      let text = result.response.text();
      // Discord messages cap at 2000 characters
      if (text.length > 1900) text = text.slice(0, 1900) + '… (truncated)';
      await interaction.editReply(text || 'I got an empty response, try rephrasing.');
    } catch (err) {
      console.error('Gemini error:', err);
      await interaction.editReply('The AI service had an error — try again in a moment.');
    }
  },
};
