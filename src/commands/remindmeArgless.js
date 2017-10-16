const timeRXes = {
    'next': 'one',
    'a ': 'one ',
    'an ': 'one ',
    'sec ': 'second ',
    'min ': 'minute ',
    'mins ': 'minutes '
};
const time = require('time-parser');
const messageCollector = require('../utils/messageCollector.js');
module.exports = async function (Bot, msg) {
    const delarray = [];
    const cleanup = async () => {
        if (msg.channel.type === 0 && msg.channel.permissionsOf(Bot.client.user.id).has('manageMessages')) {
            msg.channel.deleteMessages(delarray);
        }
    };
    delarray.push(msg.id);

    Bot.sendMessage(msg.channel.id, 'What would you like the reminder to be? (You can send `cancel` at any time to cancel creation.)')
        .then(m => delarray.push(m.id));

    const collector = new messageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 60000 });
    let step = 1;
    const r = {
        reminderText: undefined,
        dueDate: undefined,
        channelID: undefined
    };

    collector.on('message', async m => {
        if (m.content.length === 0 && !m.attachments[0]) {
            return;
        }
        if (m.content.startsWith(`${msg.channel.guild.prefix}remind`) || m.content.includes(`${Bot.client.user.id}> remind`)) {
            cleanup();
            return collector.stop();
        }
        if (m.content.toLowerCase().includes('cancel') || m.content.toLowerCase() === 'c') {
            Bot.sendMessage(msg.channel.id, 'Cancelled.');
            return collector.stop();
        }

        delarray.push(m.id);

        if (step === 1) {
            r.reminderText = m.content || m.attachments[0].proxy_url;

            Bot.sendMessage(msg.channel.id, 'When would you like to be reminded? (e.g. 24 hours)')
                .then(m => delarray.push(m.id));
        }

        if (step === 2) {
            Object.keys(timeRXes).map(regexKey => {
                if (m.content.includes(regexKey)) {
                    m.content = m.content.replace(new RegExp(regexKey, 'gi'), timeRXes[regexKey]);
                }
            });

            const parsedTime = time(m.content);
            if (!isNaN(m.content) || !parsedTime.absolute) {
                return Bot.sendMessage(msg.channel.id, 'Invalid time argument. When would you like to be reminded? (e.g. `12 hours` or `next week`).')
                    .then(m => delarray.push(m.id));
            }
            if (parsedTime.relative < 0) {
                return Bot.sendMessage(msg.channel.id, 'Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed. Also make sure to specify a year in the case of an absolute date.\nWhen would you like to be reminded? (e.g. `12 hours` or `next week`).')
                    .then(m => delarray.push(m.id));
            }

            r.dueDate = parsedTime.absolute;
            Bot.sendMessage(msg.channel.id, 'Would you like to receive the reminder in a specific channel, or in your DMs?\nMention the channel you\'d like to receive the reminder in, or send `DM` if you\'d like to receive it in your DMs.')
                .then(m => delarray.push(m.id));
        }

        if (step === 3) {
            if (!['dm', 'dms'].includes(m.content.toLowerCase())) {
                if (!m.channelMentions[0] && !m.content.includes('here')) {
                    return Bot.sendMessage(msg.channel.id, 'You need to either ping the channel you\'d like to receive your reminder in, send `here` or send `DM`.\nWhere would you like to receive your reminder?')
                        .then(m => delarray.push(m.id));
                }
                r.channelID = (m.channelMentions[0] || { id: m.channel.id }).id;
            }

            collector.stop();

            await Bot.db.run(`INSERT INTO reminders (owner, reminderText, createdDate, dueDate, channelID)
                VALUES (?, ?, ?, ?, ?);`, msg.author.id, r.reminderText, Date.now(), r.dueDate, r.channelID);

            Bot.sendMessage(msg.channel.id, { embed: {
                color: Bot.config.embedColor,
                description: `:ballot_box_with_check: Reminder added: ${r.reminderText}`,
                footer: { text: 'Reminder set for ' },
                timestamp: new Date(r.dueDate)
            }});
            cleanup();
        }
        step++;
    });

    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            Bot.sendMessage(msg.channel.id, 'Prompt timed out.');
        }
    });
};