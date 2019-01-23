import fs from 'fs';
import stream from 'stream';

import Discord  from 'discord.js';

import { loadHqr } from './hqr';
import { loadTexts } from './text';
import Languages from './constants';
import config from './config.json';

const language = Languages.LBA2[0];
const allquotes = [];

console.log('Preloading...');
let index = 0;
language.entries.forEach((e) => {
    try {
        const texts = loadTexts(language, e);
        const vox = loadHqr(`VOX2/EN_AAC_${index}.VOX`);
        texts.forEach((t) => {
            try {
                const voxEntry = vox.getEntry(t.index);
                const filename = `data/VOX2/dump/EN_AAC_${index}_${t.index}.aac`;
                t.filename = filename;
                fs.writeFileSync(filename, Buffer.from(voxEntry));
            } catch (e) { console.log(e)}
        });
        allquotes.push(...texts);
    } catch (e) { console.log(e)}
    index++;
});
console.log('Preloading... [OK]');

const randomText = (randomEntry) => {
    const texts = loadTexts(language, language.entries[randomEntry]);
    return texts[Math.floor(Math.random() * texts.length)];
};

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const voiceChannel = client.channels.get(config.channel.voice);
    voiceChannel.join();

    const channel = client.channels.get(config.channel.quotes);
    setInterval(
        () => {
            const text = allquotes[Math.floor((Math.random() * allquotes.length))];
            const dialog = `${text.value}`;
            const quote = '```' + dialog + '```' + `*\`LBA2 (#${text.index})\`*`;
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
            const text = allquotes[Math.floor((Math.random() * allquotes.length))];

            const dialog = `${text.value}`;
            const quote = '```' + dialog + '```' + `*\`LBA2 (#${text.index})\`*`;
            message.reply(quote);

            const voiceChannel = client.channels.get(config.channel.voice); // message.member.voiceChannel;
            voiceChannel.join().then(connection =>
            {
                const dispatcher = connection.playFile(text.filename, { bitrate: 128000 }); // connection.playStream(fs.createReadStream(filename)); 
                dispatcher.on("end", end => {
                    // voiceChannel.leave();
                });
            }).catch(err => console.log(err));
            break;
    }
});

client.login(config.token);
