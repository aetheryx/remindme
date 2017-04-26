const time = require('time-parser');
const settings = require('../storage/settings.json');
const fs = require('fs');
const moment = require('moment');
const rp = require('request-promise');

require('moment-duration-format');

exports.run = function(client, msg, Discord, blocked, db, prefixdb) {
    if (!prefixdb[msg.guild.id]) prefixdb[msg.guild.id] = settings.defaultPrefix;

    if (msg.isMentioned(client.user.id) && msg.content.toLowerCase().includes('prefix')) return msg.channel.send(`My prefix in this guild is \`${prefixdb[msg.guild.id]}\`.`);

    const cmd = msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length).split(' ')[0];

    if (cmd === 'reboot' || cmd === 'restart') {
        if (msg.author.id !== settings.ownerID) return msg.reply('You do not have permission to use this command.');
        msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setDescription('Rebooting...')).then(() => {
            client.destroy();
        }).then(() => process.exit());
    };

    if (cmd === 'invite') return msg.channel.sendEmbed(new Discord.RichEmbed()
        .setColor(settings.embedColor)
        .setDescription('[Invite me to your server!](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=' + client.user.id + ')\n[Click here for a link to my support server.](https://discord.gg/Yphr6WG)'));

    if (cmd === 'block') { // test write
        if (msg.author.id !== settings.ownerID) return msg.reply('You do not have permission to use this command.');
        if (msg.mentions.users.size === 0) return msg.channel.send('No users mentioned.');
        blocked.push(msg.mentions.users.first().id);
        fs.writeFile('./storage/blocked.json', JSON.stringify(blocked, '', '\t'), (err) => {
            if (err) return false;
            msg.channel.sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription(`${msg.mentions.users.first().username} successfully blocked`)
            );
        });
        return;
    };

    if (cmd === 'unblock') { // test write
        if (msg.author.id !== settings.ownerID) return msg.reply('You do not have permission to use this command.');
        if (msg.mentions.users.size === 0) return msg.channel.send('No users mentioned.');
        blocked.splice(blocked.indexOf(msg.mentions.users.first().id), 1);
        fs.writeFile('./storage/blocked.json', JSON.stringify(blocked, '', '\t'), (err) => {
            if (err) return false;
            msg.channel.sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription(`${msg.mentions.users.first().username} successfully unblocked`)
            );
        });
        return;
    };

    if (cmd === 'stats' || cmd === 'info') {
        let os = require('os'),
            embed = new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setTitle(`RemindMeBot ${settings.version}`)
            .setURL('https://discordbots.org/bot/290947970457796608')
            .addField('Guilds', client.guilds.size, true)
            .addField('Uptime', moment.duration(process.uptime(), 'seconds').format('dd:hh:mm:ss'), true)
            .addField('Ping', `${(client.ping).toFixed(0)} ms`, true)
            .addField('RAM Usage', `${(process.memoryUsage().rss / 1048576).toFixed()}MB/${(os.totalmem() > 1073741824 ? (os.totalmem() / 1073741824).toFixed(1) + ' GB' : (os.totalmem() / 1048576).toFixed() + ' MB')}
(${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%)`, true)
            .addField('System Info', `${process.platform} (${process.arch})\n${(os.totalmem() > 1073741824 ? (os.totalmem() / 1073741824).toFixed(1) + ' GB' : (os.totalmem() / 1048576).toFixed(2) + ' MB')}`, true)
            .addField('Libraries', `[Discord.js](https://discord.js.org) v${Discord.version}\nNode.js ${process.version}`, true)
            .addField('Links', '[Bot invite](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=290947970457796608) | [Support server invite](https://discord.gg/Yphr6WG) | [GitHub](https://github.com/Aetheryx/remindme) | [Bot Page](https://discordbots.org/bot/290947970457796608)', true)
            .setFooter('Created by Aetheryx#2222');

        return msg.channel.sendEmbed(embed);
    };

    if (cmd === 'ping') return msg.channel.send(`:ping_pong: Pong! ${client.pings[0]}ms`)

    if (cmd === 'ev') {
        if (msg.author.id !== settings.ownerID) return false;
        let script = msg.content.substring(prefixdb[msg.guild.id].length + 3, msg.content.length);
        let silent = script.includes('--silent') ? true : false
        if (silent) script = script.replace('--silent', '')
        try {
            let code = eval(script);
            if (typeof code !== 'string')
                code = require('util').inspect(code, {
                    depth: 0
                });
            code = code.replace(new RegExp(client.token.slice(4), "gi"), "*");
            if (!silent) msg.channel.sendCode('js', code)
        } catch (e) {
            msg.channel.send('\n`ERROR` ```xl\n' + e + '\n```');
        };
        return;
    };

    if (cmd === 'exec') {
        if (msg.author.id !== settings.ownerID) return false;
        let script = msg.content.substring(prefixdb[msg.guild.id].length + 5, msg.content.length);
        require('child_process').exec(script, (e, stdout, stderr) => {
            if (stdout.length > 2000 || stderr.length > 2000) {
                let options = {
                    method: "POST",
                    uri: "https://hastebin.com/documents",
                    body: stdout
                };
                rp(options).then(data => {
                      msg.channel.sendEmbed(new Discord.RichEmbed()
                        .setColor(settings.embedColor)
                        .setDescription(`Console log exceeds 2000 characters. View [here](https://hastebin.com/${JSON.parse(data).key}).`));
                });
            } else {
                stdout && msg.channel.sendMessage('Info: \n\`\`\`' + stdout + '\`\`\`')
                stderr && msg.channel.sendMessage('Errors: \n\`\`\`' + stderr + '\`\`\`')
                if (!stderr && !stdout) msg.react("\u2611")
            };
        });
    };

    if (cmd === 'help' || msg.isMentioned(client.user.id) && msg.content.toLowerCase().includes('help')) return msg.channel.send(`To set a reminder, simply send \`${prefixdb[msg.guild.id]}remindme\` and follow the instructions. Alternatively, you can also send \`${prefixdb[msg.guild.id]}remindme <time argument> "<message>"\`. \nMy prefix is \`${prefixdb[msg.guild.id]}\`; here's a list of my commands:`, {
        embed: new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setDescription('remindme, list, clear, prefix, stats, ping, help, invite'.split(', ').sort().join(', '))
    });

    if (cmd === 'reminders' || cmd === 'list') {
        if (!db[msg.author.id] || db[msg.author.id].length === 0) return msg.reply('You have no reminders set!');
        client.users.get(msg.author.id).sendEmbed(new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .addField(`Current reminder${(db[msg.author.id].length > 1 ? 's' : '')}:`, db[msg.author.id].map(r => r.reminder).join('\n'))
            .setFooter(`Reminder${(db[msg.author.id].length > 1 ? 's' : '')} set to expire in(dd:hh:mm:ss): ${db[msg.author.id].map(b => moment.duration(b.when - Date.now(), 'milliseconds').format('dd:hh:mm:ss')).join(', ')}`)).then(() => {
            msg.channel.send(':ballot_box_with_check: Check your DMs!');
        }).catch(err => {
            if (err.message === 'Forbidden')
                msg.channel.sendEmbed(new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .addField(`Current reminder${(db[msg.author.id].length > 1 ? 's' : '')}:`, db[msg.author.id].map(r => r.reminder).join('\n'))
                    .setFooter(`Reminder${(db[msg.author.id].length > 1 ? 's' : '')} set to expire in(dd:hh:mm:ss): ${db[msg.author.id].map(b => moment.duration(b.when - Date.now(), 'milliseconds').format('dd:hh:mm:ss')).join(', ')}`));
        });
        return;
    };

    if (cmd === 'clear' || cmd === 'delete') {
        let delarray = [];
        if (!db[msg.author.id] || db[msg.author.id].length === 0) return msg.reply('You have no reminders set!');
        delarray.push(msg);
        msg.channel.send(':warning: This will delete all of your reminders! Are you sure? (`y`/`n`)').then(a => delarray.push(a))
        const collector = msg.channel.createCollector(m => msg.author.id === m.author.id, {
            time: 40000
        });

        collector.on('message', m => {
            delarray.push(m)
            if (m.content.toLowerCase() === 'y' || m.content.toLowerCase() === 'yes') {
                db[msg.author.id] = [];
                fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
                    if (err) return msg.channel.send('Your reminders weren\'t cleared.\n' + err.message);
                    msg.channel.send(':ballot_box_with_check: Reminders cleared.')
                });
                if (m.channel.permissionsFor(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray)
                return collector.stop();
            } else {
                msg.channel.send(':ballot_box_with_check: Cancelled.')
                if (m.channel.permissionsFor(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray)
                return collector.stop();
            };
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                if (m.channel.permissionsFor(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray);
                msg.channel.send('Prompt timed out.')
            }
        })
        return;
    };

    if (msg.content.toLowerCase() === prefixdb[msg.guild.id] + 'remindme') {
        let delarray = [];
        delarray.push(msg)
        msg.channel.send('What would you like the reminder to be? (You can send `cancel` at any time to cancel creation.)')
            .then(m => delarray.push(m))

        const collector = msg.channel.createCollector(m => msg.author.id === m.author.id, {
            time: 35000
        })

        let step = 1,
            dboption = {
                'reminder': undefined,
                'when': undefined,
                'made': msg.createdTimestamp
            };

        collector.on('message', m => {
            delarray.push(m)

            if (m.content.toLowerCase() === 'cancel') {
                if (m.channel.permissionsFor(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray);
                msg.channel.send('Cancelled.');
                return collector.stop();
            };

            if (m.content.toLowerCase() === prefixdb[m.guild.id] + 'remindme') {
                if (m.channel.permissionsFor(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray);
                return collector.stop();
            };

            if (step === 1) {
                if (m.content.length === 0) return msg.channel.send('The reminder cannot be empty.\nWhat would you like the reminder to be?').then(a => delarray.push(a));
                dboption.reminder = m.content;
                msg.channel.send('When would you like to be reminded? (e.g. 24 hours)').then(a => delarray.push(a));
            };

            if (step === 2) {
                let tParse = time(m.content).absolute;
                if (m.content === 'tommorow') tParse = time('24 hours').absolute;
                if (m.content.includes('next')) tParse = time(m.content.replace(/next/g, 'one')).absolute;
                if (m.content.startsWith('a ') || m.content.startsWith('an ')) tParse = time(m.content.replace(/a /g, 'one ').replace(/an /g, 'one ')).absolute;
                if (m.content.includes(' min')) tParse = time(m.content.replace(/ min/g, 'minutes ')).absolute;
                if (!isNaN(m.content) || !tParse) return msg.channel.send('Invalid time.\nWhen would you like to be reminded? (e.g. 24 hours)').then(a => delarray.push(a));
                if (time(m.content).relative < 0) {
                    collector.stop();
                    // if (msg.guild.members.get(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray);
                    return msg.channel.send('Your reminder wasn\'t added. \n__**ERR**: Unless you have a time machine, you can\'t set reminders in the past.__');
                };
                collector.stop();
                dboption.when = tParse;
                if (!db[msg.author.id]) db[msg.author.id] = [];
                db[msg.author.id].push(dboption);
                fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
                    if (err) return msg.channel.send('Your reminder wasn\'t added.\n' + err.message);
                    msg.channel.sendEmbed(new Discord.RichEmbed()
                        .setColor(settings.embedColor)
                        .setDescription(`:ballot_box_with_check: Reminder added: ${dboption.reminder}`)
                        .setFooter(`Reminder set for `)
                        .setTimestamp(new Date(tParse))).then(() => {
                        if (m.channel.permissionsFor(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray);
                    });
                });
            };
            step++;
        });
        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                if (msg.channel.permissionsFor(client.user.id).hasPermission('MANAGE_MESSAGES')) msg.channel.bulkDelete(delarray);
                msg.channel.send('Prompt timed out.')
            };
        });
    };

    if (cmd === 'prefix') {
        if (msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length + 7, msg.content.length) === '') return msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setDescription(`The current prefix for this guild is \`${prefixdb[msg.guild.id]}\`.`))

        if (msg.author.id === msg.guild.owner.id || msg.author.id === settings.ownerID) {
            if (msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length + 7, msg.content.length).length > 16) return msg.channel.send('Please keep your prefix below 16 characters.')
            prefixdb[msg.guild.id] = msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length + 7, msg.content.length)
            fs.writeFile('./storage/prefixdb.json', JSON.stringify(prefixdb, '', '\t'), (err) => {
                if (err) return msg.channel.send('Your prefix couldn\'t be changed.\n' + err.message);
                msg.channel.send(`Prefix successfully changed to \`${prefixdb[msg.guild.id]}\` for this guild.`)
            });
        } else {
            return msg.channel.send('You do not have the required permissions for this command.')
        };
    };

    if (cmd === 'remindme' && msg.content.length > prefixdb[msg.guild.id].length + 10) {
        if (!msg.content.includes(`"`)) return msg.channel.send('Argument error. Please follow the proper syntax for the command:\n`' + prefixdb[msg.guild.id] + 'remindme <time argument> "<message>"`')
        let timeArg = msg.content.substring(prefixdb[msg.guild.id].length + 9, msg.content.indexOf('"') - 1),
            tParse = time(timeArg).absolute;
        if (timeArg.includes('next')) tParse = time(timeArg.replace(/next/g, 'one')).absolute;
        if (timeArg.startsWith('a ') || timeArg.startsWith('an ')) tParse = time(timeArg.replace(/a /g, 'one ').replace(/an /g, 'one ')).absolute;
        if (!isNaN(timeArg) || !tParse) return msg.channel.send('Invalid time. Please enter a proper time argument, e.g. `12 hours` or `next week`.')
        if (time(timeArg).relative < 0) return msg.channel.send('Your reminder wasn\'t added. \n__**ERR**: Unless you have a time machine, you can\'t set reminders in the past.__');
        let reminder = msg.content.substring(msg.content.indexOf('"') + 1, msg.content.length - 1),
            dboption = {
                'reminder': reminder,
                'when': tParse,
                'made': msg.createdTimestamp
            };
        if (!db[msg.author.id]) db[msg.author.id] = [];
        db[msg.author.id].push(dboption);
        fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
            if (err) return msg.channel.send('Your reminder wasn\'t added.\n' + err.message);
            msg.channel.sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription(`:ballot_box_with_check: Reminder added: ${dboption.reminder}`)
                .setFooter(`Reminder set for `)
                .setTimestamp(new Date(tParse)));
        });
        return;
    }

    /*    if (cmd === 'forget') {
            let delarray = [];
            if (!db[msg.author.id] || db[msg.author.id].length === 0) return msg.reply('You have no reminders set!')
            delarray.push(msg)
            msg.channel.send('Here's a list of your current reminders: ', {
                embed: new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .setTitle('Reminders')
                    .setDescription(Object.keys(db[msg.author.id]).map((e, i) => `[${i + 1}] ` + db[msg.author.id][e].reminder).join('\n'))
                    .setFooter('Send the number of the reminder you want me to forget(e.g. `3`), or send `c` to cancel.')
            }).then(m => delarray.push(m))
            const collector = msg.channel.createCollector(m => msg.author.id === m.author.id)
            collector.on('message', m => {
                if (isNaN(m.content)) return msg.channel.send('Argument entered is not a number. Send the number of the reminder you want me to forget(e.g. `3`), or send `c` to cancel.')
                if (parseInt(m.content) > Object.keys(db[msg.author.id]).length) return msg.channel.send('You don't have that many reminders, please choose a lower number.')
                let remindr = db[msg.author.id][parseInt(m.content) - 1]
                db[msg.author.id] = db[msg.author.id].filter(x => x.reminder != db[msg.author.id][parseInt(m.content) - 1].reminder)
            })
        } */


};
