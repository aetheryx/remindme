const os = require('os');
const moment = require('moment');
const botVersion = require('../../package.json').version;
const snekfetch = require('snekfetch');
const { version } = require('discord.js');
const time = require('time-parser');
const humanize = require('humanize-duration');
const { exec } = require('child_process');
const util = require('util');
const timeRXes = {
    'next' : 'one',
    'a '   : 'one ',
    'an '  : 'one ',
    'sec ' : 'second',
    'min ' : 'minute'
};

require('moment-duration-format');

module.exports = async function (Bot, msg) {
    const prefix = await Bot.prefixes.get(msg.guild ? msg.guild.id : null) || Bot.config.defaultPrefix;
    const command = msg.content.toLowerCase().slice(prefix.length).split(' ')[0];
    const args = msg.content.split(' ').filter(arg => arg !== Bot.client.user.toString()).slice(1);
    const isCommand = (commands) => {
        if (!Array.isArray(commands)) {
            commands = [commands];
        }
        return commands.includes(command) && msg.content.startsWith(prefix) ||
        msg.isMentioned(Bot.client.user.id) && commands.some(word => msg.content.toLowerCase().includes(word));
    };


    if (isCommand('ping')) {
        msg.channel.send(`:ping_pong: Pong! ${Bot.client.ping.toFixed()}ms`);
    }

    if (isCommand('invite')) {
        msg.channel.send({ embed: {
            color: Bot.config.embedColor,
            description: `Click [here](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${Bot.client.user.id}) to invite me to your server, or click [here](https://discord.gg/Yphr6WG) for an invite to RemindMeBot's support server.`
        }});
    }

    if (isCommand('help')) {
        msg.channel.send(`To set a reminder, simply send \`${prefix}remindme\` and follow the instructions. \nAlternatively, you can also send \`${prefix}remindme time_argument "message"\`, e.g. \`${prefix}remindme 31 December 2017 "New Years"\`.\nMy prefix is \`${prefix}\`; here's a list of my commands: `, { embed: {
            color: Bot.config.embedColor,
            description: 'clear, forget, help, info, invite, list, ping, prefix, remindme'
        }});
    }

    if (isCommand(['stats', 'info'])) {
        msg.channel.send({ embed: {
            color: Bot.config.embedColor,
            title: `RemindMeBot ${botVersion}`,
            url: 'http://remindmebot.xyz',
            fields: [
                { name: 'Guilds',      value: Bot.client.guilds.size, inline: true },
                { name: 'Uptime',      value: moment.duration(process.uptime(), 'seconds').format('dd:hh:mm:ss'), inline: true },
                { name: 'Ping',        value: `${Bot.client.ping.toFixed()} ms`, inline: true },
                { name: 'RAM Usage',   value: `${(process.memoryUsage().rss / 1048576).toFixed()}MB/${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)} GB` : `${(os.totalmem() / 1048576).toFixed()} MB`)}
(${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%)`, inline: true },
                { name: 'System Info', value: `${process.platform} (${process.arch})\n${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)} GB` : `${(os.totalmem() / 1048576).toFixed(2)} MB`)}`, inline: true },
                { name: 'Libraries',   value: `[Discord.js](https://discord.js.org) v${version}\n[Node.js](https://nodejs.org/en/) ${process.version}`, inline: true },
                { name: 'Links',       value: '[Bot invite](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=290947970457796608) | [Support server invite](https://discord.gg/Yphr6WG) | [GitHub](https://github.com/Aetheryx/remindme) | [Website](http://remindmebot.xyz)' },
            ],
            footer: { text: 'Created by Aetheryx#2222' }
        }});
    }

    if (isCommand(['prefix', 'setprefix'])) {
        if (msg.channel.type !== 'text') {
            return msg.channel.send('Custom prefixes are currently not supported in DMs.');
        }
        if (!args[0]) {
            return msg.channel.send(`The prefix in this server is \`${prefix}\`.`);
        }
        if (args.join(' ').length > 32) {
            return msg.channel.send('Your prefix cannot be longer than 32 characters.');
        }
        if (!msg.member.hasPermission('MANAGE_GUILD')) {
            return msg.channel.send('You are not authorized to use this command.');
        }
        if (!Bot.prefixes.has(msg.guild.id)) {
            await Bot.db.run('INSERT INTO prefixes (guildID, prefix) VALUES (?, ?);', msg.guild.id, args.join(' '));
        } else {
            await Bot.db.run('UPDATE prefixes SET prefix = ? WHERE guildID = ?;', args.join(' '), msg.guild.id);
        }
        Bot.prefixes.set(msg.guild.id, args.join(' '));
        msg.channel.send(`Prefix successfully changed to \`${args.join(' ')}\` for this guild.`);
    }

    if (isCommand(['list', 'reminders'])) {
        const reminders = await Bot.db.all('SELECT reminderText, dueDate, createdDate FROM reminders WHERE owner = ?;', msg.author.id);
        if (!reminders[0]) {
            return msg.reply('You have no reminders set.');
        }

        const embed = {
            color: Bot.config.embedColor,
            title: `Current reminder${plural(reminders)}:`,
            fields: []
        };

        reminders.forEach(r => {
            if (embed.fields.length < 25) {
                embed.fields.push({
                    name:  `Due in ${humanize(r.dueDate - Date.now(), { conjunction: ' and ', serialComma: false, largest: 3, round: true })}`,
                    value: r.reminderText
                });
            }
        });

        msg.author.send({ embed })
            .then(() => {
                msg.channel.send(':ballot_box_with_check: Check your DMs!');
            })
            .catch(err => {
                if (err.message === 'Cannot send messages to this user') {
                    msg.channel.send({ embed });
                }
            });
    }

    if (isCommand('clear')) {
        const res = await Bot.db.get('SELECT rowid FROM reminders WHERE owner = ? LIMIT 1', msg.author.id);
        if (!res) {
            return msg.reply('You have no reminders set.');
        }

        msg.channel.send(':warning: This will delete all of your reminders! Are you sure? (`y`/`n`)');

        let m = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 5000, errors: ['time'] })
            .catch(() => {
                return msg.channel.send('Prompt timed out.');
            });
        m = m.first ? m.first() : m;

        if (m.author.id === Bot.client.user.id) {
            return;
        }

        if (m.content.toLowerCase() === 'y') {
            Bot.db.run('DELETE FROM reminders WHERE owner = ?', msg.author.id)
                .then(() => {
                    msg.channel.send(':ballot_box_with_check: Reminders cleared.');
                })
                .catch(err => {
                    msg.channel.send(`Your reminders weren't cleared.\n${err.message}`);
                });
        } else if (m.content.includes('clear')) {
            return;
        } else {
            msg.channel.send(':ballot_box_with_check: Cancelled.');
        }
    }

    if (isCommand(['forget', 'delete'])) {
        const reminders = await Bot.db.all('SELECT rowid, reminderText FROM reminders WHERE owner = ?;', msg.author.id);
        if (!reminders[0]) {
            return msg.reply('You have no reminders set.');
        }
        msg.channel.send('Here\'s a list of your current reminders:', { embed: {
            color: Bot.config.embedColor,
            title: 'Reminders',
            description: reminders.map((r, i) => `[${i + 1}] ${r.reminderText}`).join('\n'),
            footer: { text: 'Send the number of the reminder you want me to forget (e.g. 3), or send c to cancel.' }
        }});

        const fetchAndParseInput = async () => {
            let m;
            try {
                m = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 45000, errors: ['time'] });
            } catch (e) {
                msg.channel.send('Prompt timed out.');
                return false;
            }
            m = m.first().content.toLowerCase();
            if (m.includes('delete') || m.includes('forget')) {
                return false;
            }
            if (m === 'c' || m === 'cancel') {
                msg.channel.send('Cancelled.');
                return false;
            }

            if (!parseInt(m)) {
                msg.channel.send('Send the number of the reminder you want me to forget (e.g. 2), or send c to cancel.');
                return fetchAndParseInput();
            }
            if (parseInt(m) > reminders.length) {
                msg.channel.send('You don\'t have that many reminders. Send the number of the reminder you want me to forget (e.g. 3), or send c to cancel.');
                return fetchAndParseInput();
            }
            return parseInt(m);
        };

        const choice = await fetchAndParseInput();
        if (choice) {
            const r = reminders[choice - 1];
            const res = await Bot.db.run('DELETE FROM reminders WHERE rowid = ?;', r.rowid);
            if (res) {
                msg.channel.send(`Reminder \`${r.reminderText}\` deleted successfully.`);
            }
        }
    }

    if (isCommand('remindme') && args[0]) {
        if (!msg.content.includes('"')) {
            return msg.channel.send(`Argument error. Please follow the proper syntax for the command:\n\`${prefix}remindme time_argument "message"\`, e.g. \`${prefix}remindme 31 December 2017 "New Years"\``);
        }

        const timeRX = new RegExp(`${prefix}remindme(.*?)"`, 'i');
        let timeArg = timeRX.exec(msg.cleanContent)[1];

        Object.keys(timeRXes).map(regexKey => {
            if (timeArg.includes(regexKey)) {
                timeArg = timeArg.replace(new RegExp(regexKey, 'gi'), timeRXes[regexKey]);
            }
        });

        const parsedTime = time(timeArg.trim());
        if (!isNaN(timeArg) || !parsedTime.absolute) {
            return msg.channel.send('Invalid time argument. Please enter a proper time argument, e.g. `12 hours` or `next week`.');
        }
        if (parsedTime.relative < 0) {
            return msg.channel.send('Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed.');
        }

        const channelRX = /channel: *(<#[0-9]{18}>)/g;
        const channelID = channelRX.exec(msg.content);

        const reminderRX = /"(.*?)"/i;
        const reminder = reminderRX.exec(msg.cleanContent)[1].trim();
        if (reminder.length > 1000) {
            return msg.channel.send('Your reminder cannot exceed 1000 characters.');
        }

        Bot.db.run(`INSERT INTO reminders (owner, reminderText, createdDate, dueDate, channelID)
        VALUES (?, ?, ?, ?, ?);`,      msg.author.id, reminder, Date.now(), parsedTime.absolute, channelID ? channelID[1].replace(/<|>|#/g, '') : null)
            .then(res => {
                if (res) {
                    msg.channel.send({ embed: {
                        color: Bot.config.embedColor,
                        description: `:ballot_box_with_check: Reminder added: ${reminder}`,
                        footer: { text: 'Reminder set for ' },
                        timestamp: new Date(parsedTime.absolute)
                    }});
                }
            })
            .catch(err => {
                msg.channel.send(`Your reminder wasn't added. This incident has been logged.\n${err.message}`);
                Bot.log(err.stack, 'error');
            });
    }

    if (isCommand('remindme') && !args[0]) {
        const delarray = [];
        delarray.push(msg);

        msg.channel.send('What would you like the reminder to be? (You can send `cancel` at any time to cancel creation.)')
            .then(m => delarray.push(m));

        const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id, { time: 60000 });
        let step = 1;
        const r = {
            reminderText: undefined,
            dueDate:      undefined,
            channelID:    undefined
        };

        collector.on('collect', async m => {
            delarray.push(m);
            if (m.content.length === 0 && !m.attachments.first()) {
                return;
            }
            if (m.content.toLowerCase().includes('remindme') || m.content.toLowerCase().includes('cancel')) {
                if (msg.channel.type === 'text' && msg.channel.permissionsFor(msg.guild.me || await msg.guild.fetchMember(Bot.client.user)).has('MANAGE_MESSAGES')) {
                    msg.channel.bulkDelete(delarray);
                }
                return collector.stop();
            }

            if (step === 1) {
                r.reminderText = m.content || m.attachments.first().proxyURL;

                msg.channel.send('When would you like to be reminded? (e.g. 24 hours)')
                    .then(m => delarray.push(m));
            }

            if (step === 2) {
                Object.keys(timeRXes).map(regexKey => {
                    if (m.content.includes(regexKey)) {
                        m.content = m.content.replace(new RegExp(regexKey, 'gi'), timeRXes[regexKey]);
                    }
                });

                const parsedTime = time(m.content);
                if (!isNaN(m.content) || !parsedTime.absolute) {
                    return msg.channel.send('Invalid time argument. When would you like to be reminded? (e.g. `12 hours` or `next week`).')
                        .then(m => delarray.push(m));
                }
                if (parsedTime.relative < 0) {
                    return msg.channel.send('Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed.\nWhen would you like to be reminded? (e.g. `12 hours` or `next week`).')
                        .then(m => delarray.push(m));
                }

                r.dueDate = parsedTime.absolute;
                msg.channel.send('Would you like to receive the channel in a specific channel, or in your DMs?\nMention the channel you\'d like to receive the reminder in, or send `DM` if you\'d like to receive it in your DMs.')
                    .then(m => delarray.push(m));
            }

            if (step === 3) {
                if (m.content.toLowerCase() !== 'dm' && m.content.toLowerCase() !== 'dms') {
                    if (!m.mentions.channels.first()) {
                        return msg.channel.send('You need to either ping the channel you\'d like to receive your reminder in or send `DM`.\nWhere would you like to receive your reminder?')
                            .then(m => delarray.push(m));
                    }
                    r.channelID = m.mentions.channels.first() ? m.mentions.channels.first().id : null;
                }

                collector.stop();

                Bot.db.run(`INSERT INTO reminders (owner, reminderText, createdDate, dueDate, channelID)
                VALUES (?, ?, ?, ?, ?);`, msg.author.id, r.reminderText, Date.now(), r.dueDate, r.channelID)
                    .then(res => {
                        if (res) {
                            msg.channel.send({ embed: {
                                color: Bot.config.embedColor,
                                description: `:ballot_box_with_check: Reminder added: ${r.reminderText}`,
                                footer: { text: 'Reminder set for ' },
                                timestamp: new Date(r.dueDate)
                            }});
                        }
                    })
                    .catch(err => {
                        msg.channel.send(`Your reminder wasn't added. This incident has been logged.\n${err.message}`);
                        Bot.log(err.stack, 'error');
                    });
            }
            step++;
        });

        collector.on('end', async (collected, reason) => {
            if (msg.channel.type === 'text' && msg.channel.permissionsFor(msg.guild.me || await msg.guild.fetchMember(Bot.client.user)).has('MANAGE_MESSAGES')) {
                msg.channel.bulkDelete(delarray);
            }
            if (reason === 'time') {
                msg.channel.send('Prompt timed out.');
            }
        });
    }

    if (msg.author.id !== Bot.owner.id) {
        return;
    }

    if (isCommand(['reboot', 'restart'])) {
        await msg.channel.send('Restarting...');
        await Bot.client.destroy();
        process.exit();
    }

    if (isCommand(['ev', 'eval'])) {
        let input = args.join(' ');
        const silent = input.includes('--silent');
        const asynchr = input.includes('--async');
        if (silent || asynchr) {
            input = input.replace(/--silent|--async/g, '');
        }

        let result;
        try {
            result = asynchr ? eval(`(async()=>{${input}})();`) : eval(input);
            if (result instanceof Promise && asynchr) {
                result = await result;
            }
            const tokenRegex = new RegExp(Bot.client.token, 'gi');
            if (typeof result !== 'string') {
                result = util.inspect(result, { depth: 0 });
            }
            result = result.replace(tokenRegex, '*');
        } catch (err) {
            result = err.message;
        }

        if (!silent) {
            msg.channel.send(`${input}\n\`\`\`js\n${result}\n\`\`\``);
        } else {
            msg.delete().catch(() => {});
        }
    }

    if (isCommand(['bash', 'exec'])) {
        exec(args.join(' '), async (e, stdout, stderr) => {
            if (stdout.length + stderr.length > 2000) {
                const res = await snekfetch.post('https://hastebin.com/documents')
                    .send(`${stdout}\n\n${stderr}`);

                msg.channel.send({ embed: {
                    color: Bot.config.embedColor,
                    description: `Console log exceeds 2000 characters. View [here](https://hastebin.com/${res.body.key}).`
                }});
            } else {
                if (!stderr && !stdout) {
                    return msg.react('\u2611');
                }
                msg.channel.send(stdout ? `Info: \`\`\`\n${stdout}\n\`\`\`` : '',
                    stderr ? `Errors: \`\`\`\n${stderr}\`\`\`` : '');
            }
        });
    }
};

function plural (item) {
    return item.length > 1 ? 's' : '';
}