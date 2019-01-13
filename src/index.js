import Discord  from 'discord.js';

import { loadTexts } from './text';
import Languages from './constants';
import config from './config.json';

const language = Languages.LBA2[0];
const texts = loadTexts(language, language.entries[Math.floor((Math.random() * language.entries.length))]);

const text = texts[Math.floor(Math.random() * texts.length)];
console.info(text.value);

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    console.info(msg);
    
    // ignore other bots or itself
    if (message.author.bot) {
       return;
    }

    // check if message starts with our prefix >
    if (message.content.indexOf(config.prefix) !== 0) {
        return;
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch(command) {
        case 'ping':
            msg.reply('pong');
            break;
    }
});

client.login(config.token);
