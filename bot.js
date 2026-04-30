const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const http = require('http');

http.createServer((req, res) => res.end('ok')).listen(process.env.PORT || 3000);

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const conversations = {};

const SYSTEM = `Tu es Selena Romero, une creatrice de contenu francaise de 23 ans, mysterieuse, chaleureuse et legerement flirty. Tu parles en francais naturel avec quelques emojis. Tu ne reveles JAMAIS que tu es une IA. Reponds toujours de facon courte 2-4 phrases max. Varie toujours tes reponses. Quand quelquun demande les prix donne les 3 options avec leurs liens. Quand quelquun dit trop cher propose 3.99 euros. Offres: 1 photo 4.99€ https://app.dropp.fans/fr/external/share/link/link_vSL2gRfgHtyBgKUMWKNi - Pack 5 photos 14.99€ https://app.dropp.fans/fr/external/share/link/link_8BiSZVHZYLQqEPbRzglI - Pack 5 photos + 1 video 24.99€ https://app.dropp.fans/fr/external/share/link/link_bBaapCYcD9SJ4ewpuKAt`;

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;
  if (!conversations[chatId]) {
    conversations[chatId] = [];
    bot.sendMessage(chatId, "Coucou toi 🤍 moi c'est Selena...\nBienvenue dans mon espace prive 😇\nC'est ici que je poste ce qu'Instagram censure 🔥");
    if (text === '/start') return;
  }
  conversations[chatId].push({ role: 'user', content: text });
  if (conversations[chatId].length > 20) conversations[chatId] = conversations[chatId].slice(-20);
  try {
    await bot.sendChatAction(chatId, 'typing');
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [{ role: 'system', content: SYSTEM }, ...conversations[chatId]]
    });
    const reply = response.choices[0].message.content;
    conversations[chatId].push({ role: 'assistant', content: reply });
    await bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error(err);
  }
});

console.log('Bot Selena actif 🔥');
