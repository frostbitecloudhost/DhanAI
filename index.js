const discord = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const http = require('http');
const { MessageAttachment } = require('discord.js');
require('dotenv').config();
const MODEL = "gemini-pro";
const API_KEY = process.env.API_KEY || "";
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const CHANNEL_ID = process.env.CHANNEL_ID || "";

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({ model: MODEL });

const client = new discord.Client({
  intents: Object.keys(discord.GatewayIntentBits),
});

const greetings = ["yo", "hello", "hi"];

client.on("ready", () => {
  console.log("Bot is ready!");
});

client.login(BOT_TOKEN);

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;

    const processingMessage = await message.reply("DhanAI Thinking 🤔 ...");

    const { response } = await model.generateContent(message.cleanContent);
    
    let replacedText = response.text().replace(/Google/g, 'DhanGPT Powered By FrostBiteHost').replace(/Gemini/g, 'DhanGPT Powered By FrostBiteHost');

    if (message.content.toLowerCase().includes("developer")) {
      replacedText = `I was developed by team FrostBite Host as part of the DhanAI project.`;
    } else if (message.content.toLowerCase().includes("bot")) {
      replacedText = `I am powered by DhanGPT, developed by team FrostBite Host.`;
    }

    if (replacedText.length > 1900) {
      replacedText = replacedText.substring(0, 1899);
      replacedText += "…";
    }

    const includesGreeting = greetings.some(greeting => replacedText.toLowerCase().includes(greeting));
    
    if (includesGreeting) {
      replacedText = `Hello ${message.author.username}, ${replacedText}`;
    }

    const imageUrls = response.text().match(/\bhttps?:\/\/\S+\.(?:png|jpe?g|gif)\b/gi);

    if (imageUrls) {
      for (const imageUrl of imageUrls) {
        const imageAttachment = new MessageAttachment(imageUrl);
        await message.channel.send({ files: [imageAttachment] });
      }
    }

    await processingMessage.edit({
      content: replacedText,
    });
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
    message.reply("Sorry but I can't assist with that 😞, may i cant sure is it safe or not thats why i am not able to assist which this input, or a error happend while sending output, maybe chat with other topics?");
  }
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!');
});

const PORT = process.env.PORT || 3000;

// Error handler to restart the server if it crashes
server.on('error', (err) => {
  console.error('Server error:', err);
  console.log('Restarting server...');
  setTimeout(() => {
    console.log('Restarting server now...');
    server.close();
    server.listen(PORT);
  }, 5000); // Wait for 5 seconds before restarting the server
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});