async function sendReminder (Bot, err, r) {
    if (err) {
        return Bot.log(err.stack, 'error');
    }

    const embed = {
        color: Bot.config.embedColor,
        fields: [ { name: 'You asked to be reminded of:', value: r.reminderText } ],
        footer: { text: 'Reminder originally set on ' },
        timestamp: new Date(r.createdDate)
    };

    try {
        if (r.channelID) {
            const sent = await Bot.sendMessage(r.channelID, { content: `<@${r.owner}>`, embed });
            if (!sent) {
                Bot.sendMessage(r.owner, { content: `I tried to send this to <#${r.channelID}>, but I'm not allowed to speak there.`, embed }, true);
            }
        } else {
            Bot.sendMessage(r.owner, { embed }, true);
        }
    } catch (err) {
        Bot.log(err.stack, 'error');
    } finally {
        await Bot.db.run('DELETE FROM reminders WHERE rowid = ?;', r.rowid);
    }
}


module.exports = async (Bot) => {
    setInterval(async () => {
        await Bot.db.each('SELECT rowid, owner, reminderText, createdDate, channelID FROM reminders WHERE dueDate < ?;',
            Date.now(),
            async (...args) => sendReminder(Bot, ...args));
    }, Bot.config.tick);
};
