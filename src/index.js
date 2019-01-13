
import Discord  from 'discord.js';
import { loadTexts } from './text';
import Languages from './constants';
import config from './config.json';

const language = Languages.LBA2[0];
/* const texts = loadTexts(language, language.entries[Math.floor((Math.random() * language.entries.length))]);
const text = texts[Math.floor(Math.random() * texts.length)];
console.info(text.value); */

const randomText = () => {
    const texts = loadTexts(language, language.entries[Math.floor((Math.random() * language.entries.length))]);
    return texts[Math.floor(Math.random() * texts.length)];
};

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const channel = client.channels.get('534072057286361089') // #quote channel
    setInterval(
        () => {
            const text = randomText();
            const message = `${text.value}`;
            const quote = '```' + message + '```' + `*\`LBA2 (#${text.index})\`*`;
            channel.send(quote);
        },
        10800000 // every 3h
    );
})

client.on('message', message => {
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
            message.reply('pong');
            break;
        case 'lba2':
            const text = randomText();
            const message = `${text.value}`;
            const quote = '```' + message + '```' + `*\`LBA2 (#${text.index})\`*`;
            message.reply(quote);
            break;
    }
});

client.login(config.token);
