module.exports = async (Bot) => {
    setInterval(async () => {
        await Bot.db.each('SELECT rowid, owner, reminderText, createdDate, channelID FROM reminders WHERE dueDate < ?;',
            Date.now(), async (err, r) => {
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
                    if (r.channelID && Bot.client.channels.get(r.channelID)) {
                        try {
                            Bot.client.channels.get(r.channelID).send({ embed });
                        } catch (err) {
                            if (err.message.includes('Missing Access')) {
                                try {
                                    (await Bot.client.fetchUser(r.owner)).send(`I tried to send this to <#${r.channelID}>, but I'm not allowed to speak there.`, { embed });
                                } catch (e) {
                                    // Sometimes the owner doesn't have DMs enabled or they're not in a shared guild anymore (so we're not allowed to DM them).. nothing we can do at that point.
                                }
                            }
                        }
                    } else if (!r.channelID) {
                        const owner = await Bot.client.fetchUser(r.owner);
                        if (owner) {
                            try {
                                owner.send({ embed });
                            } catch (e) {
                                // More or less same as the comment above.
                            }
                        }
                    }
                } catch (err) {
                    Bot.log(err.stack, 'error');
                } finally {
                    await Bot.db.run('DELETE FROM reminders WHERE rowid = ?;', r.rowid);
                }
            });
    }, Bot.config.tick);
};
