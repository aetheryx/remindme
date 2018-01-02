async function clearCommand (msg) {
  const reminders = await this.db.getReminders(msg.author.id);
  if (!reminders[0]) {
    return 'You have no reminders set.';
  }

  this.sendMessage(msg.channel.id, `:warning: This will delete all of your reminders (${reminders.length} total)! Are you sure? (\`y\`/\`n\`)`);

  // eslint-disable-next-line prefer-const
  let [message, reason] = await msg.channel.awaitMessages(this.client, m => m.author.id === msg.author.id, { maxMatches: 1, time: 25000 });

  if (!message[0] && reason === 'time') {
    return 'Prompt timed out.';
  }

  message = message[0].content.toLowerCase();
  if (message === 'y') {
    await Promise.all(reminders.map(reminder => this.db.deleteReminder(reminder._id)));
    return `:ballot_box_with_check: ${reminders.length} reminders cleared.`;
  } else if (message.includes('clear')) {
    return;
  } else {
    return 'Cancelled.';
  }
}

module.exports = {
  command: clearCommand,
  name: 'clear',
  description : 'Starts a guided tour to clear all of your reminders.'
};