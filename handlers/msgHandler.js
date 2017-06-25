const botVersion = require('../package.json').version;
const snekfetch = require('snekfetch');
const moment    = require('moment');
const exec      = require('child_process').exec;
const time      = require('time-parser');
const fs        = require('fs');
const os        = require('os');

require('moment-duration-format');

exports.run = async function (msg) {
    if (isCommand(msg, 'ping'))
        msg.channel.send(`:ping_pong: Pong! ${client.pings[0]}ms`);

    if (isCommand(msg, ['reboot', 'restart'])) {
        if (msg.author.id !== settings.ownerID)
            return msg.reply('You do not have permission to use this command.');
        await msg.channel.send('Restarting...');
        await client.destroy();
        process.exit();
    }

    if (isCommand(msg, 'invite'))
        msg.channel.send({
            embed: new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription(`Click [here](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${client.user.id}) to invite me to your server, or click [here](https://discord.gg/Yphr6WG) for an invite to RemindMeBot\'s support server.`)
        });

    if (isCommand(msg, ['stats', 'info'])) {
        const embed = new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setTitle(`RemindMeBot ${botVersion}`)
            .setURL('https://discordbots.org/bot/290947970457796608')
            .addField('Guilds', client.guilds.size, true)
            .addField('Uptime', moment.duration(process.uptime(), 'seconds').format('dd:hh:mm:ss'), true)
            .addField('Ping', `${client.ping.toFixed(0)} ms`, true)
            .addField('RAM Usage', `${(process.memoryUsage().rss / 1048576).toFixed()}MB/${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)} GB` : `${(os.totalmem() / 1048576).toFixed()} MB`)}
(${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%)`, true)
            .addField('System Info', `${process.platform} (${process.arch})\n${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)} GB` : `${(os.totalmem() / 1048576).toFixed(2)} MB`)}`, true)
            .addField('Libraries', `[Discord.js](https://discord.js.org) v${Discord.version}\nNode.js ${process.version}`, true)
            .addField('Links', '[Bot invite](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=290947970457796608) | [Support server invite](https://discord.gg/Yphr6WG) | [GitHub](https://github.com/Aetheryx/remindme)', true)
            .setFooter('Created by Aetheryx#2222');

        msg.channel.send({ embed });
    }

    if (isCommand(msg, 'help'))
        msg.channel.send(`To set a reminder, simply send \`${prefixdb[msg.guild.id]}remindme\` and follow the instructions. Alternatively, you can also send \`${prefixdb[msg.guild.id]}remindme time_argument "message"\`, \ne.g. \`${prefixdb[msg.guild.id]}remindme 31 December 2017 "New Years"\`.\nMy prefix is \`${prefixdb[msg.guild.id]}\`; here's a list of my commands: `, {
            embed: new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription('remindme, list, clear, prefix, info, ping, help, invite, forget'.split(', ').sort().join(', '))
        });

    if (isCommand(msg, ['reminders', 'list'])) {
        if (!db[msg.author.id] || db[msg.author.id].length === 0)
            return msg.reply('You have no reminders set!');

        client.users.get(msg.author.id).send({
            embed: new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .addField(`Current reminder${plural(db[msg.author.id])}:`, db[msg.author.id].map((r) => r.reminder).join('\n'))
                .setFooter(`Reminder${plural(db[msg.author.id])} set to expire in(dd:hh:mm:ss): ${db[msg.author.id].map((b) => moment.duration(b.when - Date.now(), 'milliseconds').format('dd:hh:mm:ss')).join(', ')}`)
        }).then(() => {
            msg.channel.send(':ballot_box_with_check: Check your DMs!');
        }).catch((err) => {
            if (err.message === 'Forbidden')
                msg.channel.send({
                    embed: new Discord.RichEmbed()
                        .setColor(settings.embedColor)
                        .addField(`Current reminder${plural(db[msg.author.id])}:`, db[msg.author.id].map((r) => r.reminder).join('\n'))
                        .setFooter(`Reminder${plural(db[msg.author.id])} set to expire in(dd:hh:mm:ss): ${db[msg.author.id].map((b) => moment.duration(b.when - Date.now(), 'milliseconds').format('dd:hh:mm:ss')).join(', ')}`)
                });
        });
    }

    if (isCommand(msg, 'clear')) {
        if (!db[msg.author.id] || db[msg.author.id].length === 0)
            return msg.reply('You have no reminders set!');

        msg.channel.send(':warning: This will delete all of your reminders! Are you sure? (`y`/`n`)');

        const collector = msg.channel.createMessageCollector(m => msg.author.id === m.author.id, { time: 40000 });

        collector.on('collect', (m) => {
            if (m.content.toLowerCase() === 'y' || m.content.toLowerCase() === 'yes') {
                db[msg.author.id] = [];
                fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
                    if (err) 
                        return msg.channel.send(`Your reminders weren't cleared.\n${err.message}`);
                    msg.channel.send(':ballot_box_with_check: Reminders cleared.');
                });
            } else {
                msg.channel.send(':ballot_box_with_check: Cancelled.');
            }
            return collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time')
                msg.channel.send('Prompt timed out.');
        });
    }

    if (isCommand(msg, ['forget', 'delete'])) { // Very beta, kind of unstable.
        if (!db[msg.author.id] || db[msg.author.id].length === 0)
            return msg.reply('You have no reminders set!');

        msg.channel.send('Here\'s a list of your current reminders: ', {
            embed: new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setTitle('Reminders')
                .setDescription(Object.keys(db[msg.author.id]).map((e, i) => `[${i + 1}] ${db[msg.author.id][e].reminder}`).join('\n'))
                .setFooter('Send the number of the reminder you want me to forget(e.g. 3), or send c to cancel.')
        });
        const collector = msg.channel.createMessageCollector((m) => msg.author.id === m.author.id, { time: 40000 });
        collector.on('collect', (m) => {
            if (m.content.toLowerCase().startsWith(`${prefixdb[m.guild.id]}forget`) || m.content.toLowerCase() === 'cancel' || m.content.toLowerCase() === 'c')
                return collector.stop();

            if (isNaN(m.content))
                return msg.channel.send('Argument entered is not a number. Send the number of the reminder you want me to forget (e.g. `3`), or send `c` to cancel.');

            if (parseInt(m.content) > Object.keys(db[msg.author.id]).length)
                return msg.channel.send('You don\'t have that many reminders, please choose a lower number.');

            const reminder = db[msg.author.id][parseInt(m.content) - 1];
            db[msg.author.id] = db[msg.author.id].filter((x) => x.reminder !== db[msg.author.id][parseInt(m.content) - 1].reminder);

            fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
                if (err) return msg.channel.send(`Your reminder wasn't removed.\n${err.message}`);
            });

            msg.channel.send(`Reminder \`${reminder.reminder}\` deleted.`);
            return collector.stop();
        });
    }

    const cmd = msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length).split(' ')[0];
    const args = msg.content.split(' ').slice(1);

    if (isCommand(msg, 'prefix') && !args[0])
        msg.channel.send(`My prefix in this guild is \`${prefixdb[msg.guild.id]}\`.`);

    if (isCommand(msg, 'remindme') && !args[0]) {
        const delarray = [];
        delarray.push(msg);
        msg.channel.send('What would you like the reminder to be? (You can send `cancel` at any time to cancel creation.)')
            .then((m) => delarray.push(m));

        const collector = msg.channel.createMessageCollector((m) => msg.author.id === m.author.id, { time: 40000 });

        let step = 1;

        const dboption = {
            'reminder': undefined,
            'when': undefined,
            'made': msg.createdTimestamp
        };

        collector.on('collect', (m) => {
            delarray.push(m);
            if (m.content.toLowerCase() === `${prefixdb[m.guild.id]}remindme` || m.content.toLowerCase() === 'cancel') {
                if (m.channel.permissionsFor(client.user).has('MANAGE_MESSAGES'))
                    m.channel.bulkDelete(delarray);
                return collector.stop();
            }

            if (step === 1) {
                if (m.content.length === 0)
                    return msg.channel.send('The reminder cannot be empty.\nWhat would you like the reminder to be?').then((a) => delarray.push(a));

                dboption.reminder = m.content;

                msg.channel.send('When would you like to be reminded? (e.g. 24 hours)').then((a) => delarray.push(a));
            }

            if (step === 2) {
                let tParse = time(m.content).absolute;

                if (m.content.includes('next'))
                    tParse = time(m.content.replace(/next/g, 'one')).absolute;

                if (m.content.startsWith('a ') || m.content.startsWith('an '))
                    tParse = time(m.content.replace(/a /g, 'one ').replace(/an /g, 'one ')).absolute;

                if (m.content.includes(' min'))
                    tParse = time(m.content.replace(/ min/g, 'minutes ')).absolute;

                if (!isNaN(m.content) || !tParse)
                    return msg.channel.send('Invalid time.\nWhen would you like to be reminded? (e.g. 24 hours)').then((a) => delarray.push(a));

                if (time(m.content).relative < 0) {
                    collector.stop();
                    return msg.channel.send('Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed.');
                }

                collector.stop();
                dboption.when = tParse;
                if (!db[msg.author.id])
                    db[msg.author.id] = [];

                db[msg.author.id].push(dboption);
                fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
                    if (err) return msg.channel.send(`Your reminder wasn't added.\n${err.message}`);
                    msg.channel.send({
                        embed: new Discord.RichEmbed()
                            .setColor(settings.embedColor)
                            .setDescription(`:ballot_box_with_check: Reminder added: ${dboption.reminder}`)
                            .setFooter('Reminder set for ')
                            .setTimestamp(new Date(tParse))
                    }).then(() => {
                        if (m.channel.permissionsFor(client.user).has('MANAGE_MESSAGES'))
                            msg.channel.bulkDelete(delarray);
                    });
                });
            }
            step++;
        });
        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                if (msg.channel.permissionsFor(client.user).hasPermission('MANAGE_MESSAGES'))
                    msg.channel.bulkDelete(delarray);

                msg.channel.send('Prompt timed out.');
            }
        });
    }

    if (cmd === 'ev') {
        if (msg.author.id !== settings.ownerID) 
            return false;
        let res = args.join(' ');
        const silent = res.includes('--silent') ? true : false;
        const asynchr = res.includes('--async') ? true : false;
        if (silent || asynchr) res = res.replace('--silent', '').replace('--async', '');

        try {
            res = asynchr ? eval(`(async()=>{${res}})();`) : eval(res);
            if (res instanceof Promise && asynchr) code = await res;
            if (typeof code !== 'string')
                res = require('util').inspect(res, { depth: 0 });
            res = res.replace(new RegExp(client.token, 'gi'), 'fite me irl');
        } catch (e) {
            res = e;
        }
        if (!silent)
            msg.channel.send(res, { code: 'js' });
    }

    if (cmd === 'exec') {
        if (msg.author.id !== settings.ownerID)
            return false;
        exec(args.join(' '), async (e, stdout, stderr) => {
            if (stdout.length > 2000 || stderr.length > 2000) {
                const res = await snekfetch.post('https://hastebin.com/documents')
                    .send(`${stdout}\n\n${stderr}`)
                    .catch((e) => msg.channel.send(e.message));

                msg.channel.send({
                    embed: new Discord.RichEmbed()
                        .setColor(settings.embedColor)
                        .setDescription(`Console log exceeds 2000 characters. View [here](https://hastebin.com/${res.body.key}).`)
                });
            } else {
                stdout && msg.channel.send(`Info: \n\`\`\`${stdout}\`\`\``);
                stderr && msg.channel.send(`Errors: \n\`\`\`${stderr}\`\`\``);
                if (!stderr && !stdout)
                    msg.react('\u2611');
            }
        });
    }

    if (cmd === 'prefix') {
        if (!args[0])
            return msg.channel.send({
                embed: new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .setDescription(`The current prefix for this guild is \`${prefixdb[msg.guild.id]}\`.`)
            });

        if (msg.author.id !== msg.guild.owner.id && msg.author.id !== settings.ownerID)
            return msg.channel.send('You do not have the required permissions for this command.');

        if (args[0].length > 16)
            return msg.channel.send('Please keep your prefix below 16 characters.');

        prefixdb[msg.guild.id] = args[0];
        fs.writeFile('./storage/prefixdb.json', JSON.stringify(prefixdb, '', '\t'), (err) => {
            if (err) return msg.channel.send(`Your prefix couldn't be changed.\n${err.message}`);
            msg.channel.send(`Prefix successfully changed to \`${prefixdb[msg.guild.id]}\` for this guild.`);
        });

    }

    if (cmd === 'remindme' && msg.content.length > prefixdb[msg.guild.id].length + 10) {
        if (!msg.content.includes('"'))
            return msg.channel.send(`Argument error. Please follow the proper syntax for the command:\n\`${prefixdb[msg.guild.id]}remindme time_argument "message"\`, e.g. \`${prefixdb[msg.guild.id]}remindme 31 December 2017 "New Years"\``);

        const timeArg = msg.content.substring(prefixdb[msg.guild.id].length + 9, msg.content.indexOf('"') - 1);
        let tParse = time(timeArg).absolute;

        if (timeArg.includes('next'))
            tParse = time(timeArg.replace(/next/g, 'one')).absolute;

        if (timeArg.startsWith('a ') || timeArg.startsWith('an '))
            tParse = time(timeArg.replace(/a /g, 'one ').replace(/an /g, 'one ')).absolute;

        if (!isNaN(timeArg) || !tParse)
            return msg.channel.send('Invalid time argument. Please enter a proper time argument, e.g. `12 hours` or `next week`.');

        if (time(timeArg).relative < 0)
            return msg.channel.send('Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed.');

        const reminder = msg.content.substring(msg.content.indexOf('"') + 1, msg.content.length - 1),
            dboption = {
                'reminder': reminder,
                'when': tParse,
                'made': msg.createdTimestamp
            };

        if (!db[msg.author.id])
            db[msg.author.id] = [];

        db[msg.author.id].push(dboption);
        fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
            if (err) return msg.channel.send(`Your reminder wasn't added.\n${err.message}`);
            msg.channel.send({
                embed: new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .setDescription(`:ballot_box_with_check: Reminder added: ${dboption.reminder}`)
                    .setFooter('Reminder set for ')
                    .setTimestamp(new Date(tParse))
            });
        });
    }

    if (cmd === 'purge') {
        if (!msg.channel.permissionsFor(msg.author.id).has('MANAGE_MESSAGES') && msg.author.id !== settings.ownerID)
            return msg.channel.send('You do not have the required permissions for this command.');
        let messages = await msg.channel.fetchMessages({ limit: 100 });
        messages = messages.array().filter(message => message.author.id === client.user.id);
        messages.length = parseInt(args[0]) || 1;
        messages.forEach(message => message.delete());
    }
};

function plural (x) {
    return x.length > 1 ? 's' : '';
}

function isCommand (msg, x) {
    const cmd = msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length).split(' ')[0];
    if (!Array.isArray(x))
        x = [x];
    return x.includes(cmd) || msg.isMentioned(client.user.id) && x.some((c) => msg.content.toLowerCase().includes(c));
}