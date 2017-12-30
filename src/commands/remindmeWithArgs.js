const timeRXes = {
    'next': 'one',
    'a ': 'one ',
    'an ': 'one ',
    'sec ': 'second ',
    'min ': 'minute ',
    'mins ': 'minutes '
};
const time = require('time-parser');

module.exports = async function (Bot, msg, args) {
    args = args.join(' ');
    if (!args.includes('"') && !args.includes('“') && !args.includes('”')) { // :(
        return Bot.sendMessage(msg.channel.id, `Argument error. Please follow the proper syntax for the command:\n\`${msg.prefix}remindme time_argument "message"\`, e.g. \`${msg.prefix}remindme 31 December 2017 "New Years"\``);
    }

    const timeRX = new RegExp('(.*?)("|“|”)', 'i');
    let timeArg = timeRX.exec(args)[1];
    Object.keys(timeRXes).map(regexKey => {
        if (timeArg.includes(regexKey)) {
            timeArg = timeArg.replace(new RegExp(regexKey, 'gi'), timeRXes[regexKey]);
        }
    });

    const parsedTime = time(timeArg.trim());
    if (!isNaN(timeArg) || !parsedTime.absolute) {
        return Bot.sendMessage(msg.channel.id, 'Invalid time argument. Please enter a proper time argument, e.g. `12 hours` or `next week`.');
    }
    if (parsedTime.relative < 0) {
        return Bot.sendMessage(msg.channel.id, 'Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed. Also make sure to specify a year in the case of an absolute date.\n\nWhen would you like to be reminded? (e.g. `12 hours` or `next week`).');
    }

    const channelRX = /channel: *(<#[0-9]{18}>|here)/g;
    const channelID = channelRX.exec(args);
    if (channelID && channelID[1] === 'here') {
        channelID[1] = msg.channel.id;
    }

    const recurRX = /-r$/i;
    const recurring = recurRX.test(args) ? 1 : 0;

    const reminderRX = /("|“|”)([^]*?)("|“|”)/i;
    const reminder = reminderRX.exec(msg.cleanContent)[2].trim();
    if (reminder.length > 1000) {
        return Bot.sendMessage(msg.channel.id, 'Your reminder cannot exceed 1000 characters.');
    }

    await Bot.db.run(`INSERT INTO reminders (owner, reminderText, createdDate, duration, recurring, dueDate, channelID)
        VALUES (?, ?, ?, ?, ?, ?, ?);`, msg.author.id, reminder, Date.now(), parsedTime.relative, recurring, parsedTime.absolute, channelID ? channelID[1].replace(/<|>|#/g, '') : null);

    Bot.sendMessage(msg.channel.id, {
        embed: {
            color: Bot.config.embedColor,
            description: `:ballot_box_with_check: Reminder added: ${reminder}`,
            footer: { text: 'Reminder set for ' },
            timestamp: new Date(parsedTime.absolute)
        }
    });
};