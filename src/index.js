import fs from 'fs';
import stream from 'stream';

import Discord  from 'discord.js';

import { loadHqr } from './hqr';
import { loadTexts } from './text';
import Languages from './constants';
import config from './config.json';

const language = Languages.LBA2[0];
const allquotes = [];

let characters = null;
let lba2who = [];

process.on("unhandledRejection", err => {
    console.error("Uncaught Promise Error: \n" + err.stack);
});

process.on("error", err => {
    console.error("Uncaught Error: \n" + err.stack);
});

console.log('Preloading...');
let index = 0;
let entryIndex = 0;
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
                t.entryIndex = entryIndex;
                entryIndex += 1;
            } catch (e) { console.log(e)}
        });
        allquotes.push(...texts);
    } catch (e) { console.log(e)}
    index++;
});

const charactersFilename = 'metadata/characters.json';
if (fs.existsSync(charactersFilename)) {
    const charactersMetadata = fs.readFileSync(charactersFilename);
    characters = JSON.parse(charactersMetadata);
}

const lba2Filename = 'metadata/lba2who.json';
if (fs.existsSync(lba2Filename)) {
    const lba2Metadata = fs.readFileSync(lba2Filename);
    lba2who = JSON.parse(lba2Metadata);
}

console.log('Preloading... [OK]');

const randomText = (randomEntry) => {
    const texts = loadTexts(language, language.entries[randomEntry]);
    return texts[Math.floor(Math.random() * texts.length)];
};

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // // every 3h random message disabled
    // const channel = client.channels.get(config.channel.quotes);
    // setInterval(
    //     () => {
    //         const text = allquotes[Math.floor((Math.random() * allquotes.length))];
    //         const dialog = `${text.value}`;
    //         const quote = '```' + dialog + '```' + `*\`LBA2 (#${text.index})\`*`;
    //         channel.send(quote);
    //     },
    //     10800000 // every 3h
    // );
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

        case 'lba1':
            message.reply('Sorry, LBA1 quotes are not implemented yet!');
            break;

        case 'lba2':
            let randomEntry = -1;
            if (args.length > 0) {
                if (!isNaN(args[0])) {
                    randomEntry = parseInt(args[0]);
                } else if (args[0].includes('#')) {
                    randomEntry = parseInt(args[0].split('#')[1]);
                } else {
                    const quotes = allquotes.filter((q) => q.value.toLowerCase().includes(args[0].toLowerCase()));
                    if (quotes && quotes.length > 0) {
                        randomEntry = quotes[Math.floor(Math.random() * quotes.length)].entryIndex;
                    }
                }
                if (randomEntry === -1) {
                    message.reply(`LBA2 quote containing *\`${args[0]}\`* was not found!!`);
                    break;
                }
            } else {
                randomEntry = Math.floor((Math.random() * allquotes.length));
            }
            
            let thumbnail = null;
            //let author = null;
            let fields = null;
            const who = lba2who[randomEntry];
            if (who) {
                const character = characters[who];
                thumbnail = { url: character.portrait };
                // author = {
                //     name: `${character.name} says:`,
                //     // "icon_url": character.portrait,
                // };
                fields = [{
                        name: 'Character',
                        value: character.name,
                        inline: true,
                    },
                    {
                        name: 'Race',
                        value: character.race,
                        inline: true,
                    }
                ];
            }
            
            const text = allquotes[randomEntry];
            message.channel.send({
                embed: {
                    description: '```' + text.value + '```',
                    footer: {
                        text: `LBA2 | ${randomEntry}`,
                    },
                    thumbnail,
                    // author,
                    fields,
                }
            });

            const voiceChannel = client.channels.get(config.channel.voice); // message.member.voiceChannel;
            voiceChannel.join().then(connection =>
            {
                const dispatcher = connection.playFile(text.filename, { bitrate: 128000 }); // connection.playStream(fs.createReadStream(filename)); 
                dispatcher.on("end", end => {
                    voiceChannel.leave();
                });
            }).catch(err => console.log(err));
            break;

        case 'who':
            if (args.length === 3) {
                const game = args[0];
                const entry = args[1];
                const character = args[2];
                if (game === 'lba2' && !isNaN(entry) && characters[character]) {
                    lba2who[entry] = character;
                    fs.writeFileSync('metadata/lba2who.json', JSON.stringify(lba2who, null, 2));
                }
            } else {
                message.reply('who command needs 3 arguments, game (lba2), entry (234) and character (twinsen)');
            }
            break;
    }
});

client.on('disconnect', async () => {
    client.destroy();
    client.login(config.token);
});

client.on('error', (err) => console.log(err));

client.login(config.token);
