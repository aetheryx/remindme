const humanize = require('humanize-duration');

exports.run = async function (Bot, msg) {
    const reminders = await Bot.db.all('SELECT reminderText, dueDate, createdDate FROM reminders WHERE owner = ?;', msg.author.id);
    if (!reminders[0]) {
        return Bot.sendMessage(msg.channel.id, 'You have no reminders set.');
    }

    const embed = {
        color: Bot.config.embedColor,
        title: 'Current reminder(s):',
        fields: []
    };

    reminders.forEach(r => {
        if (embed.fields.length < 25) {
            embed.fields.push({
                name: `Due in ${humanize(r.dueDate - Date.now(), { conjunction: ' and ', serialComma: false, largest: 3, round: true })}`,
                value: r.reminderText
            });
        }
    });

    const sent = await Bot.sendMessage(msg.author.id, { embed }, true);
    if (!sent) {
        Bot.sendMessage(msg.channel.id, { embed });
    } else {
        Bot.sendMessage(msg.channel.id, ':ballot_box_with_check: Check your DMs!');
    }
};

exports.props = {
    name        : 'reminders',
    usage       : '{command}',
    aliases     : ['list'],
    description : 'Receive a list of your current reminders.'
};