/** TODO LIST
 * Improve code readibility
 * Remove duplication code
 * Separate commands in their own func/file
 * Stream LBA1 quotes
*/
import fs from 'fs';
import stream from 'stream';

import Discord  from 'discord.js';

import { loadHqr } from './hqr';
import { loadTexts2, loadTexts1 } from './text';
import Languages from './constants';

const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
const config = requireFunc('./config.json');

const allquotes1 = [];
const allquotes2 = [];

let characters = null;
let lba1who = [];
let lba2who = [];

const RACES = ['unknown', 'quetch', 'rabbibunny', 'grobo', 'sphero', 'zeelichian', 'sup', 'franco', 'wannie', 'mosquibee', 'dino', 'ant', 'giraffe', 'owl', 'giraffe', 'kangoroo', 'horse', 'elf', 'camel', 'seaturtle', 'cow'];

const toUpperFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

process.on("unhandledRejection", err => {
    console.error("Uncaught Promise Error: \n" + err.stack);
});

process.on("error", err => {
    console.error("Uncaught Error: \n" + err.stack);
});

console.log('Preloading...');
let index = 0;
let entryIndex = 0;

console.log('LBA1...');
Languages.LBA1[0].entries.forEach((e) => {
    try {
        const texts = loadTexts1(Languages.LBA1[0], e);
        texts.forEach((t) => {
            try {
                t.entryIndex = entryIndex;
                entryIndex += 1;
            } catch (e) { console.log(e)}
        });
        allquotes1.push(...texts);
    } catch (e) { console.log(e)}
    index++;
});
console.log('LBA1... [OK]');

index = 0;
entryIndex = 0;
console.log('LBA2...');
Languages.LBA2[0].entries.forEach((e) => {
    try {
        const texts = loadTexts2(Languages.LBA2[0], e);
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
        allquotes2.push(...texts);
    } catch (e) { console.log(e)}
    index++;
});
console.log('LBA2... [OK]');

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
const lba1Filename = 'metadata/lba1who.json';
if (fs.existsSync(lba1Filename)) {
    const lba1Metadata = fs.readFileSync(lba1Filename);
    lba1who = JSON.parse(lba1Metadata);
}

console.log('Preloading... [OK]');

const randomText2 = (randomEntry) => {
    const texts = loadTexts2(language, language.entries[randomEntry]);
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
});

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

    const run = (c, a) => {
        switch(c) {
            case 'ping':
                message.reply('pong');
                break;

            case 'lba1': {
                let randomEntry = -1;
                if (a.length > 0) {
                    const query = a.join(' ');
                    if (!isNaN(a[0])) {
                        randomEntry = parseInt(a[0]);
                    } else if (a[0].includes('#')) {
                        randomEntry = parseInt(a[0].split('#')[1]);
                    } else {
                        const quotes = allquotes1.filter((q) => q.value.toLowerCase().includes(query.toLowerCase()));
                        if (quotes && quotes.length > 0) {
                            randomEntry = quotes[Math.floor(Math.random() * quotes.length)].entryIndex;
                        }
                    }
                    if (randomEntry === -1) {
                        message.reply(`LBA1 quote containing *\`${query}\`* was not found!!`);
                        break;
                    }
                } else {
                    randomEntry = Math.floor((Math.random() * allquotes1.length));
                }
                
                let thumbnail = null;
                //let author = null;
                let fields = null;
                const who = lba1who[randomEntry];
                if (who) {
                    const character = characters[who];
                    thumbnail = { url: character.portrait };
                    // author = {
                    //     name: `${character.name} says:`,
                    //     // "icon_url": character.portrait,
                    // };
                    switch (character.type) {
                        case 'character':    
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
                            break;

                        case 'inventory':
                            fields = [{
                                    name: 'Inventory',
                                    value: character.name,
                                    inline: true,
                                }
                            ];
                            break;
                    }
                }
                
                const text = allquotes1[randomEntry];
                if (text && text.value !== '') {
                    message.channel.send({
                        embed: {
                            description: '```' + text.value + '```',
                            footer: {
                                text: `LBA1 | ${randomEntry}`,
                            },
                            thumbnail,
                            // author,
                            fields,
                        }
                    });

                    // const voiceChannel = client.channels.get(config.channel.voice); // message.member.voiceChannel;
                    // voiceChannel.join().then(connection =>
                    // {
                    //     const dispatcher = connection.playFile(text.filename, { bitrate: 22000 }); // connection.playStream(fs.createReadStream(filename)); 
                    //     dispatcher.on("end", end => {
                    //         voiceChannel.leave();
                    //     });
                    // }).catch(err => console.log(err));
                } else {
                    message.reply(`LBA1 quote containing *\`${randomEntry}\`* was not found!!`);
                }
                break;
            }

            case 'lba2': {
                let randomEntry = -1;
                if (a.length > 0) {
                    const query = a.join(' ');
                    if (!isNaN(a[0])) {
                        randomEntry = parseInt(a[0]);
                    } else if (a[0].includes('#')) {
                        randomEntry = parseInt(a[0].split('#')[1]);
                    } else {
                        const quotes = allquotes2.filter((q) => q.value.toLowerCase().includes(query.toLowerCase()));
                        if (quotes && quotes.length > 0) {
                            randomEntry = quotes[Math.floor(Math.random() * quotes.length)].entryIndex;
                        }
                    }
                    if (randomEntry === -1) {
                        message.reply(`LBA2 quote containing *\`${query}\`* was not found!!`);
                        break;
                    }
                } else {
                    randomEntry = Math.floor((Math.random() * allquotes2.length));
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
                    switch (character.type) {
                        case 'character':    
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
                            break;

                        case 'inventory':
                            fields = [{
                                    name: 'Inventory',
                                    value: character.name,
                                    inline: true,
                                }
                            ];
                            break;
                    }
                }
                
                const text = allquotes2[randomEntry];
                if (text && text.value !== '') {
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
                        const dispatcher = connection.playFile(text.filename, { bitrate: 22000 }); // connection.playStream(fs.createReadStream(filename)); 
                        dispatcher.on("error", err => {
                            console.error(err);
                        })
                        dispatcher.on("end", end => {
                            voiceChannel.leave();
                        });
                    }).catch(err => console.log(err));
                } else {
                    message.reply(`LBA2 quote containing *\`${randomEntry}\`* was not found!!`);
                }
                break;
            }
            
            case 'who':
                if (a.length === 2) {
                    const game = a[0];
                    const entry = a[1];
                    run(game, [entry]);
                    break;
                } else if (a.length === 3) {
                    const game = a[0];
                    const entry = a[1];
                    const character = a[2];

                    // do some command param validation
                    if (game === 'lba2' && lba2who[entry]) {
                        message.reply(`This entry ${entry} is already identitied.`);
                        run('lba2', [entry]);
                        break;
                    }
                    if (game === 'lba1' && lba1who[entry]) {
                        message.reply(`This entry ${entry} is already identitied.`);
                        run('lba1', [entry]);
                        break;
                    }
                    if (!characters[character]) {
                        message.reply(`The character ${character} does not exist.`);
                        break;
                    }
                    if (isNaN(entry)) {
                        message.reply(`The entry ${entry} is not a valid number.`);
                        break;
                    }
                    if (game === 'lba1' && parseInt(entry) >= allquotes1.length) {
                        message.reply(`The entry ${entry} is not valid. Please provide a number between 0 and ${allquotes1.length - 1} for ${game} quotes`);
                        break;
                    }
                    if (game === 'lba2' && parseInt(entry) >= allquotes2.length) {
                        message.reply(`The entry ${entry} is not valid. Please provide a number between 0 and ${allquotes2.length - 1} for ${game} quotes`);
                        break;
                    }

                    if (game === 'lba2') {
                        lba2who[entry] = character;
                        fs.writeFileSync('metadata/lba2who.json', JSON.stringify(lba2who, null, 2));
                        message.reply(`${character} added to ${game} quote #${entry}`);
                        run('lba2', [entry]);
                        break;
                    }
                    if (game === 'lba1') {
                        lba1who[entry] = character;
                        fs.writeFileSync('metadata/lba1who.json', JSON.stringify(lba1who, null, 2));
                        message.reply(`${character} added to ${game} quote #${entry}`);
                        run('lba1', [entry]);
                        break;
                    }
                    
                    message.reply(`The game ${game} is not a valid type`);
                    break;
                }
                
                message.reply('who command needs 3 arguments, game (lba1|lba2), entry (234) and [character (twinsen)]');
                break;

            case 'character':
                if (a.length === 1) {
                    const id = a[0];
                    const character = characters[id];
                    const thumbnail = { url: character.portrait };
                    const fields = [{
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
                    message.channel.send({
                        embed: {
                            description: '``Id ' + id + '``',
                            thumbnail,
                            fields,
                        }
                    });
                    break;
                } else if (a.length === 3 || a.length === 4) {
                    const id = a[0];
                    const name = a[1];
                    const race = a[2];
                    const portrait = a[3] ? a[3] : '';

                    // do some command param validation
                    if (characters[id]) {
                        message.reply(`Character ${id}:${name} already exists!!`);
                        run('character', [id]);
                        break;
                    }
                    if (!RACES.includes(race.toLowerCase())) {
                        message.reply(`The race ${race} is unknown. Please provide one of this races ${RACES}`);
                        break;
                    }

                    characters[id] = {
                        type: 'character',
                        name: toUpperFirst(name).replace('_',' '),
                        race: toUpperFirst(race),
                        portrait,
                    };
                    fs.writeFileSync('metadata/characters.json', JSON.stringify(characters, null, 2));
                    message.reply(`Character ${id}:${name} added!!`);
                    run('character', [id]);
                    break;
                }
                
                message.reply('character command needs 3/4 arguments, id (twinsen|zoe|jerome), name (Twinsen|Zoé|Jérôme-Baldino), race (Quetch|Franco) and [portrait URL]');
                break;

            case 'inventory':
                if (a.length === 1) {
                    const id = a[0];
                    const character = characters[id];
                    const thumbnail = { url: character.portrait };
                    const fields = [{
                            name: 'Inventory',
                            value: character.name,
                            inline: true,
                        },
                    ];
                    message.channel.send({
                        embed: {
                            description: '``Id ' + id + '``',
                            thumbnail,
                            fields,
                        }
                    });
                    break;
                } else if (a.length === 2 || a.length === 3) {
                    const id = a[0];
                    const name = a[1];
                    const portrait = a[2] ? a[2] : '';

                    // do some command param validation
                    if (characters[id]) {
                        message.reply(`Inventory ${id}:${name} already exists!!`);
                        run('inventory', [id]);
                        break;
                    }

                    characters[id] = {
                        type: 'inventory',
                        name: toUpperFirst(name).replace('_',' '),
                        portrait,
                    };
                    fs.writeFileSync('metadata/characters.json', JSON.stringify(characters, null, 2));
                    message.reply(`Inventory ${id}:${name} added!!`);
                    run('inventory', [id]);
                    break;
                }
                
                message.reply('inventory command needs 2/3 arguments, id (tunic), name (Ancestral_Tunic) and [portrait URL]');
                break;
        }
    };

    run(command, args);
});

client.on('disconnect', async () => {
    client.destroy();
    client.login(config.token);
});

client.on('error', (err) => console.log(err));

client.login(config.token);
