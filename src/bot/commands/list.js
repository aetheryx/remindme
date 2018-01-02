const humanize = require('humanize-duration');

async function listCommand (msg) {
  const reminders = await this.db.getReminders(msg.author.id);
  if (!reminders[0]) {
    return 'You have no reminders set.';
  }

  const embed = {
    title: 'Current reminder(s):',
    fields: []
  };

  for (const reminder of reminders) {
    if (embed.fields.length < 25) {
      embed.fields.push({
        name: `Due in ${humanize(reminder.dueDate - Date.now(), { conjunction: ' and ', serialComma: false, largest: 3, round: true })}`,
        value: reminder.reminder
      });
    }
  }

  const sent = await this.sendMessage(msg.author.id, embed, true);
  if (!sent) {
    return embed;
  } else {
    return '☑ Check your DMs!';
  }
}

module.exports = {
  command: listCommand,
  name: 'list',
  aliases: ['reminders'],
  description: 'Sends you your current reminders in DM. Note: will send in channel if DMs are disabled.'
};