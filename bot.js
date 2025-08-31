require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const TRIGGER_EMOJI = process.env.TRIGGER_EMOJI;
const RESPONSE_EMOJI = process.env.RESPONSE_EMOJI;
const FAILURE_EMOJI = process.env.FAILURE_EMOJI;
const TRIGGER_MINUTE = parseInt(process.env.TRIGGER_MINUTE, 10);
const TRIGGER_HOUR = parseInt(process.env.TRIGGER_HOUR, 10);

let lastSentAM = null;
let lastSentPM = null;
let lastFailureAM = null;
let lastFailurePM = null;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toDateString(); // "Mon Feb 26 2024" (prevents duplicate sends)

    const isAM = (currentHour === TRIGGER_HOUR);
    const isPM = (currentHour === (TRIGGER_HOUR + 12) % 24);

    const isOnTime = (currentMinute === TRIGGER_MINUTE);
    const isLate = (currentMinute >= TRIGGER_MINUTE + 1 && currentMinute <= TRIGGER_MINUTE + 2); // 3:44 - 3:45 inclusive

    if (message.content.includes(TRIGGER_EMOJI)) {
        if (isAM || isPM) {
            if (isOnTime) {
                // Send success emoji if it's exactly on time
                if (isAM && lastSentAM !== today) {
                    message.channel.send(RESPONSE_EMOJI);
                    lastSentAM = today;
                } else if (isPM && lastSentPM !== today) {
                    message.channel.send(RESPONSE_EMOJI);
                    lastSentPM = today;
                }
            } else if (isLate) {
                // Send failure emoji if it's late
                if (isAM && lastFailureAM !== today) {
                    message.channel.send(FAILURE_EMOJI);
                    lastFailureAM = today;
                } else if (isPM && lastFailurePM !== today) {
                    message.channel.send(FAILURE_EMOJI);
                    lastFailurePM = today;
                }
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
