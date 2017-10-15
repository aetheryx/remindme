exports.run = async function (Bot, msg) {
    const res = await Bot.db.get('SELECT rowid FROM reminders WHERE owner = ? LIMIT 1', msg.author.id);
    if (!res) {
        return Bot.sendMessage(msg.channel.id, 'You have no reminders set.');
    }

    Bot.sendMessage(msg.channel.id, ':warning: This will delete all of your reminders! Are you sure? (`y`/`n`)');

    // eslint-disable-next-line prefer-const
    let [message, reason] = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { maxMatches: 1, time: 25000 });

    if (!message[0] && reason === 'time') {
        return Bot.sendMessage(msg.channel.id, 'Prompt timed out.');
    }

    message = message[0];
    if (message.content.toLowerCase() === 'y') {
        await Bot.db.run('DELETE FROM reminders WHERE owner = ?', msg.author.id);
        Bot.sendMessage(msg.channel.id, ':ballot_box_with_check: Reminders cleared.');
    } else if (message.content.includes('clear')) {
        return;
    } else {
        Bot.sendMessage(msg.channel.id, ':ballot_box_with_check: Cancelled.');
    }
};

exports.props = {
    name        : 'clear',
    usage       : '{command}',
    aliases     : [],
    description : 'TODO'
};