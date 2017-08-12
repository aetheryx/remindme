const os = require('os');
const moment = require('moment');
const botVersion = require('../../package.json').version;
const { version } = require('discord.js');
const time = require('time-parser');
const humanize = require('humanize-duration');
const timeRXes = {
    'next' : 'one',
    'a '   : 'one ',
    'an '  : 'one ',
    'sec ' : 'second',
    'min ' : 'minute'
};

require('moment-duration-format');

module.exports = async function (Bot, msg) {
    const prefix = await Bot.db.get('SELECT prefix FROM prefixes WHERE guildID = ?', msg.guild.id) || Bot.config.defaultPrefix;
    const command = msg.content.toLowerCase().slice(prefix.length).split(' ')[0];
    const args = msg.content.split(' ').slice(1).filter(arg => arg !== Bot.client.user.toString());
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
            description: `Click [here](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${Bot.client.user.id}) to invite me to your server, or click [here](https://discord.gg/Yphr6WG) for an invite to RemindMeBot\'s support server.`
        }});
    }

    if (isCommand('help')) {
        msg.channel.send(`To set a reminder, simply send \`${prefix}remindme\` and follow the instructions. Alternatively, you can also send \`${prefix}remindme time_argument "message"\`, \ne.g. \`${prefix}remindme 31 December 2017 "New Years"\`.\nMy prefix is \`${prefix}\`; here's a list of my commands: `, { embed: {
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

    if (isCommand(['reboot', 'restart'])) {
        if (msg.author.id !== Bot.config.ownerID) {
            return msg.reply('You do not have permission to use this command.');
        }
        await msg.channel.send('Restarting...');
        await Bot.client.destroy();
        process.exit();
    }

    if (isCommand('list')) {
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
                m = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 1000, errors: ['time'] });
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

        const parsedTime = time(timeArg.trim()).absolute;
        if (!isNaN(timeArg) || !parsedTime) {
            return msg.channel.send('Invalid time argument. Please enter a proper time argument, e.g. `12 hours` or `next week`.');
        }
        if (time(timeArg).relative < 0) {
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
        VALUES (?, ?, ?, ?, ?);`,      msg.author.id, reminder, Date.now(), parsedTime, channelID ? channelID[1].replace(/<|>|#/g, '') : null)
            .then(res => {
                if (res) {
                    msg.channel.send({ embed: {
                        color: Bot.config.embedColor,
                        description: `:ballot_box_with_check: Reminder added: ${reminder}`,
                        footer: { text: 'Reminder set for ' },
                        timestamp: new Date(parsedTime)
                    }});
                }
            })
            .catch(err => {
                msg.channel.send(`Your reminder wasn't added. This incident has been logged.\n${err.message}`);
                Bot.log(err.stack, 'error');
            });
    }

    if (isCommand(['reboot', 'restart'])) {
        if (msg.author.id !== Bot.config.ownerID) {
            return msg.reply('You do not have permission to use this command.');
        }
        await msg.channel.send('Restarting...');
        await Bot.client.destroy();
        process.exit();
    }


};

function plural (item) {
    return item.length > 1 ? 's' : '';
}