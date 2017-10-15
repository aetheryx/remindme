exports.run = async function (Bot, msg) {
    const reminders = await Bot.db.all('SELECT rowid, reminderText FROM reminders WHERE owner = ?;', msg.author.id);
    if (!reminders[0]) {
        return Bot.sendMessage(msg.channel.id, 'You have no reminders set.');
    }
    Bot.sendMessage(msg.channel.id, {
        content: 'Here\'s a list of your current reminders:',
        embed: {
            color: Bot.config.embedColor,
            title: 'Reminders',
            description: reminders.map((r, i) => `[${i + 1}] ${r.reminderText}`).join('\n'),
            footer: { text: 'Send the number of the reminder you want me to forget (e.g. `2`), or send `c` to cancel.' }
        }});

    const fetchAndParseInput = async () => {
        // eslint-disable-next-line prefer-const
        let [message, reason] = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { maxMatches: 1, time: 45000 });
        if (!message[0] && reason === 'time') {
            Bot.sendMessage(msg.channel.id, 'Prompt timed out.');
            return false;
        }

        message = message[0].content.toLowerCase();
        if (message.includes('delete') || message.includes('forget')) {
            return false;
        }
        if (message === 'c' || message === 'cancel') {
            Bot.sendMessage(msg.channel.id, 'Cancelled.');
            return false;
        }

        if (!parseInt(message)) {
            Bot.sendMessage(msg.channel.id, 'Send the number of the reminder you want me to forget (e.g. `2`), or send `c` to cancel.');
            return fetchAndParseInput();
        }
        if (parseInt(message) > reminders.length) {
            Bot.sendMessage(msg.channel.id, 'You don\'t have that many reminders. Send the number of the reminder you want me to forget (e.g. `3`), or send `c` to cancel.');
            return fetchAndParseInput();
        }
        return parseInt(message);
    };

    const choice = await fetchAndParseInput();
    if (choice) {
        const r = reminders[choice - 1];
        const res = await Bot.db.run('DELETE FROM reminders WHERE rowid = ?;', r.rowid);
        if (res) {
            Bot.sendMessage(msg.channel.id, `Reminder \`${r.reminderText}\` deleted successfully.`);
        }
    }
};

exports.props = {
    name        : 'forget',
    usage       : '{command}',
    aliases     : ['delete'],
    description : 'Starts a guided tour to forget one of your reminders.'
};