const quotes = ['"', '“', '”'];
const timeRX = new RegExp(`(.*?)(${quotes.join('|')})`, 'i');
const channelRX = /channel: *(<#[0-9]{18}>|here)/g;

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

  const channelID = args.match(channelRX);
  if (channelID && channelID[1] === 'here') {
    channelID[1] = msg.channel.id;
  } else {
    
  }

  const reminderRX = /("|“|”)([^]*?)("|“|”)/i;
  const reminder = reminderRX.exec(msg.content)[2].trim();
  if (reminder.length > 1500) {
    return 'Your reminder cannot exceed 1500 characters.';
  }
  ot.db.run(`INSERT INTO reminders (owner, reminderText, createdDate, dueDate, channelID)${}`)

  await this.db.addReminder({
    ownerID: msg.author.id,
    reminder,
    dueDate: parsedTime.absolute,
    channelID: channelID
  })




}

module.exports = remindmeWithArgs;