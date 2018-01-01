const quotes = ['"', '“', '”'];
const timeRX = new RegExp(`(.*?)(${quotes.join('|')})`, 'i');
const channelRX = new RegExp('channel: *(<#([0-9]{16,18})>|here)');

async function remindmeWithArgs (msg, args) {
  args = args.join(' ');
  const prefix = await this.db.getPrefix(msg.channel.guild.id);

  if (quotes.every(quote => !args.includes(quote))) { // :(
    return `Argument error. Please follow the proper syntax for the command:\n\`${prefix}remindme time_argument "message"\`, e.g. \`${prefix}remindme 31 December 2017 "New Years"\``;
  }

  const timeArg = args.match(timeRX)[1];
  const parsedTime = this.utils.parseTime(timeArg);

  if (parsedTime === 'INVALID') {
    return 'Invalid time argument. Please enter a proper time argument, e.g. `12 hours` or `next week`.';
  }

  if (parsedTime === 'SET_FOR_PAST') {
    return 'Your reminder wasn\'t added because it was set for the past.\nNote that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed. You can fix this by including your timezone (e.g. `6 PM PST`).';
  }

  let channelID = args.match(channelRX);
  if (channelID && channelID[1] === 'here') {
    channelID = msg.channel.id;
  } else if (channelID) {
    channelID = channelID[2];
  } else {
    channelID = null;
  }

  const reminderRX = /("|“|”)([^]*?)("|“|”)/i;
  const reminder = reminderRX.exec(msg.content)[2].trim();
  if (reminder.length > 1500) {
    return 'Your reminder cannot exceed 1500 characters.';
  }

  await this.db.addReminder({
    ownerID: msg.author.id,
    dueDate: parsedTime.absolute,
    reminder,
    channelID
  });

  return {
    embed: {
      description: `:ballot_box_with_check: Reminder added: ${reminder}`,
      footer: { text: 'Reminder set for ' },
      timestamp: new Date(parsedTime.absolute)
    }
  };

}

module.exports = remindmeWithArgs;