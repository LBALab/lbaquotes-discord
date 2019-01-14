import fs from 'fs';
import stream from 'stream';

import Discord  from 'discord.js';

import { loadHqr } from './hqr';
import { loadTexts } from './text';
import Languages from './constants';
import config from './config.json';

const language = Languages.LBA2[0];
/* const texts = loadTexts(language, language.entries[Math.floor((Math.random() * language.entries.length))]);
const text = texts[Math.floor(Math.random() * texts.length)];
console.info(text.value); */

const randomText = (randomEntry) => {
    const texts = loadTexts(language, language.entries[randomEntry]);
    return texts[Math.floor(Math.random() * texts.length)];
};

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const voiceChannel = client.channels.get('534060253587701804');
    voiceChannel.join();

    const channel = client.channels.get('534072057286361089') // #quote channel
    setInterval(
        () => {
            const randomEntry = Math.floor((Math.random() * language.entries.length));
            const text = randomText(randomEntry);
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
            const randomEntry = Math.floor((Math.random() * language.entries.length));
            const text = randomText(randomEntry);
            const vox = loadHqr(`VOX2/EN_AAC_${randomEntry}.VOX`);
            const voxEntry = vox.getEntry(text.index);
            const filename = `data/VOX2/dump/EN_AAC_${randomEntry}_${text.index}.aac`;
            fs.writeFileSync(filename, Buffer.from(voxEntry));

            const dialog = `${text.value}`;
            const quote = '```' + dialog + '```' + `*\`LBA2 (#${text.index})\`*`;
            message.reply(quote);

            const voiceChannel = client.channels.get('534060253587701804'); // message.member.voiceChannel;
            voiceChannel.join().then(connection =>
            {
                const dispatcher = connection.playFile(filename);
                dispatcher.on("end", end => {
                    voiceChannel.leave();
                });
            }).catch(err => console.log(err));
            break;
    }
});

client.login(config.token);
