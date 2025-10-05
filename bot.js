
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { DateTime } = require('luxon');

const BOT_TIMEZONE = process.env.BOT_TIMEZONE || 'Australia/Sydney';

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

// Log the current server time every minute for debugging
// setInterval(() => {
//     const now = new Date();
//     console.log(`Current server time: ${now.toString()} | UTC: ${now.toUTCString()}`);
// }, 60 * 1000);

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages


    // Use configurable timezone for DST awareness
    const now = DateTime.now().setZone(BOT_TIMEZONE);
    const currentHour = now.hour;
    const currentMinute = now.minute;
    const today = now.toFormat('EEE MMM dd yyyy'); // Similar to toDateString()

    const isAM = (currentHour === TRIGGER_HOUR);
    const isPM = (currentHour === (TRIGGER_HOUR + 12) % 24);

    const isOnTime = (currentMinute === TRIGGER_MINUTE);
    const isLate = (currentMinute >= TRIGGER_MINUTE + 1 && currentMinute <= TRIGGER_MINUTE + 2); // 3:44 - 3:45 inclusive

    if (message.content.includes(TRIGGER_EMOJI)) {
        console.log(`Trigger emoji '${TRIGGER_EMOJI}' detected at ${now.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')} (${BOT_TIMEZONE})`);
        if (isAM || isPM) {
            console.log(`It's ${TRIGGER_HOUR} ${isAM ? 'AM' : 'PM'} or ${(TRIGGER_HOUR + 12) % 24} ${isPM ? 'PM' : 'AM'}`);
            if (isOnTime) {
                console.log(`It's ${TRIGGER_HOUR}:${TRIGGER_MINUTE}!`);
                // Send success emoji if it's exactly on time
                if (isAM && lastSentAM !== today) {
                    message.channel.send(RESPONSE_EMOJI);
                    console.log(`${TRIGGER_HOUR}:${TRIGGER_MINUTE} AM successful!`);
                    lastSentAM = today;
                } else if (isPM && lastSentPM !== today) {
                    message.channel.send(RESPONSE_EMOJI);
                    console.log(`${TRIGGER_HOUR}:${TRIGGER_MINUTE} PM successful!`);
                    lastSentPM = today;
                }
            } else if (isLate) {
                console.log(`Missed ${TRIGGER_HOUR}:${TRIGGER_MINUTE}!`);
                // Send failure emoji if it's late
                if (isAM && lastFailureAM !== today) {
                    message.channel.send(FAILURE_EMOJI);
                    console.log(`${TRIGGER_HOUR}:${TRIGGER_MINUTE} AM failed!`);
                    lastFailureAM = today;
                } else if (isPM && lastFailurePM !== today) {
                    message.channel.send(FAILURE_EMOJI);
                    console.log(`${TRIGGER_HOUR}:${TRIGGER_MINUTE} PM failed!`);
                    lastFailurePM = today;
                }
            }
        }
    }

    if (message.mentions.has(client.user)) {

        const cleaned = message.content.replace(`<@${client.user.id}>`, '').trim();
        const replyText = cleaned.length > 0 ? cleaned : '^';
        message.reply(replyText);
    }

});

client.login(process.env.DISCORD_TOKEN);
