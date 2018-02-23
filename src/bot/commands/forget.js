async function forgetCommand (msg) {
  const reminders = await this.db.getReminders(msg.author.id);
  if (!reminders[0]) {
    return 'You have no reminders set.';
  }
  this.sendMessage(msg.channel.id, {
    content: 'Here\'s a list of your current reminders:',
    embed: {
      title: 'Reminders',
      description: reminders.map((r, i) => `[${i + 1}] ${r.reminder}`).join('\n'),
      footer: { text: 'Send the number of the reminder you want me to forget (e.g. 2), or send c to cancel.' }
    }});

  const fetchAndParseInput = async () => {
    // eslint-disable-next-line prefer-const
    let [message, reason] = await msg.channel.awaitMessages(this.client, m => m.author.id === msg.author.id, { maxMatches: 1, time: 45000 });
    if (!message[0] && reason === 'time') {
      this.sendMessage(msg.channel.id, 'Prompt timed out.');
      return false;
    }

    message = message[0].content.toLowerCase();
    if (message.includes('delete') || message.includes('forget')) {
      return false;
    }
    if (message === 'c' || message === 'cancel') {
      this.sendMessage(msg.channel.id, 'Cancelled.');
      return false;
    }

    if (!parseInt(message)) {
      this.sendMessage(msg.channel.id, 'Send the number of the reminder you want me to forget (e.g. `2`), or send `c` to cancel.');
      return fetchAndParseInput();
    }
    if (parseInt(message) > reminders.length) {
      this.sendMessage(msg.channel.id, 'You don\'t have that many reminders. Send the number of the reminder you want me to forget (e.g. `3`), or send `c` to cancel.');
      return fetchAndParseInput();
    }
    return parseInt(message);
  };

  const choice = await fetchAndParseInput();
  if (choice) {
    const r = reminders[choice - 1];
    await this.db.deleteReminder(r._id);
    return `Reminder \`${r.reminder}\` deleted successfully.`;
  }
}

module.exports = {
  command: forgetCommand,
  name: 'forget',
  aliases: ['delete', 'forgetti'],
  description: 'Starts a guided tour to forget one of your reminders.'
};
