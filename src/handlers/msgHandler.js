const os = require('os');
const moment = require('moment');
const botVersion = require('../../package.json').version;
const { version } = require('discord.js');
const time = require('time-parser');
const timeRXes = {
    'next': 'one',
    'a '  : 'one ',
    'an ' : 'one ',
    'sec' : 'second',
    'min' : 'minute'
};

require('moment-duration-format');

module.exports = async function (Bot, msg) {
    const prefix = await Bot.db.get('SELECT * FROM prefixes WHERE guildID = ?', msg.guild.id) || Bot.config.defaultPrefix;
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
            description: `Click [here](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${this.client.user.id}) to invite me to your server, or click [here](https://discord.gg/Yphr6WG) for an invite to RemindMeBot\'s support server.`
        }});
    }

    if (isCommand('help')) {
        msg.channel.send(`To set a reminder, simply send \`${prefix}remindme\` and follow the instructions. Alternatively, you can also send \`${prefix}remindme time_argument "message"\`, \ne.g. \`${prefix}remindme 31 December 2017 "New Years"\`.\nMy prefix is \`${prefix}\`; here's a list of my commands: `, { embed: {
            color: this.config.embedColor,
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

    if (isCommand(['forget', 'delete'])) {
        const reminders = await Bot.db.all('SELECT ROWID, reminderText FROM reminders WHERE owner = ?', msg.author.id);
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
                m = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 10000, errors: ['time'] });
            } catch (e) {
                msg.channel.send('Prompt timed out.');
                return false;
            }
            m = m.first().content.toLowerCase();
            if (m.startsWith(`${prefix}delete`) || m.startsWith(`${prefix}forget`)) {
                return false;
            }
            if (m === 'c' || m === 'cancel') {
                msg.channel.send('Cancelled.');
                return false;
            }

            if (!parseInt(m)) {
                msg.channel.send('Send the number of the reminder you want me to forget (e.g. 3), or send c to cancel.');
                return fetchAndParseInput();
            }
            if (parseInt(m) > reminders.length) {
                msg.channel.send('You don\'t have that many reminders. Send the number of the reminder you want me to forget (e.g. 3), or send c to cancel.');
                return fetchAndParseInput();
            }
            return parseInt(m);
        };

        const res = await fetchAndParseInput();
        if (res) {
            const r = reminders[res - 1];
            Bot.db.run('DELETE FROM reminders WHERE rowid = ?;', r.rowid)
                .then(res => {
                    if (res) {
                        msg.channel.send(`Reminder ${r.reminderText} deleted.`);
                    }
                });
        }
    }

    if (isCommand('remindme') && args[0]) {
        if (!msg.content.includes('"')) {
            return msg.channel.send(`Argument error. Please follow the proper syntax for the command:\n\`${prefix}remindme time_argument "message"\`, e.g. \`${prefix}remindme 31 December 2017 "New Years"\``);
        }

        const timeRX = new RegExp(`${prefix}remindme(.*?)"`, 'i');
        let timeArg = timeRX.exec(msg.cleanContent)[1].trim();
        Object.keys(timeRXes).map(regexKey => {
            if (timeArg.includes(regexKey)) {
                timeArg = timeArg.replace(new RegExp(regexKey, 'gi'), timeRXes[regexKey]);
            }
        });

        const tParse = time(timeArg).absolute;
        Bot.log(timeArg);
        if (!isNaN(timeArg) || !tParse) {
            return msg.channel.send('Invalid time argument. Please enter a proper time argument, e.g. `12 hours` or `next week`.');
        }
        if (time(timeArg).relative < 0) {
            return msg.channel.send('Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed.');
        }

        const reminderRX = /"(.*?)"/i;
        const reminder = reminderRX.exec(msg.cleanContent)[1].trim();

        Bot.db.run(`INSERT INTO reminders (owner, reminderText, createdDate, dueDate, channelID)
        VALUES (?, ?, ?, ?, ?)`,       msg.author.id, reminder, Date.now(), tParse, msg.channel.id)
            .then(res => {
                if (res) {
                    msg.channel.send({ embed: {
                        color: Bot.config.embedColor,
                        description: `:ballot_box_with_check: Reminder added: ${reminder}`,
                        footer: { text: 'Reminder set for ' },
                        timestamp: new Date(tParse)
                    }});
                }
            })
            .catch(err => {
                Bot.log(err.stack);
                msg.channel.send(`Your reminder wasn't added. This incident has been logged.\n${err.message}`);
            });
    }
};