const quotes = ['"', '\'', '“', '”'];
const timeRX = new RegExp(`(.*?)(${quotes.join('|')})|channel:|recurring:`, 'i');
const channelRX = new RegExp('channel: *(<#([0-9]{16,18})>|here)');
const recurringRX = new RegExp('recurring: *(.+?($|(?=channel)))');

async function remindmeWithArgs (msg, args) {
  args = args.join(' ');
  const prefix = await this.db.getPrefix(msg.channel.guild ? msg.channel.guild.id : null);

  if (quotes.every(quote => !args.includes(quote))) {
    return `Argument error. Please follow the proper syntax for the command:\n\`${prefix}remindme time_argument "message"\`, e.g. \`${prefix}remindme 31 December 2017 "New Years"\``;
  }

  const timeArg = args.match(timeRX)[1];
  const parsedTime = this.utils.parseTime(timeArg);

  if (parsedTime === 'INVALID') {
    return `I was unable to recognize \`${timeArg}\` as a valid time argument. Please enter a proper time argument, e.g. \`12 hours\` or \`next week\`.`;
  }

  if (parsedTime === 'SET_FOR_PAST') {
    return 'Your reminder wasn\'t added because it was set for the past.\nNote that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed. You can fix this by including your timezone (e.g. `6 PM PST`).';
  }

  const reminder = msg.content.substring(
    Math.min(...quotes.map(quote => msg.content.indexOf(quote)).filter(index => index > 0)) + 1,
    Math.max(...quotes.map(quote => msg.content.lastIndexOf(quote)).filter(index => index > 0))
  );
  if (reminder.length > 750) {
    return 'Your reminder cannot exceed 750 characters.';
  }

  let channelID = args.match(channelRX);
  if (channelID && channelID[1] === 'here') {
    channelID = msg.channel.id;
  } else if (channelID) {
    channelID = channelID[2];
  } else {
    channelID = null;
  }

  const recurring = { argument: args.match(recurringRX) };
  if (recurring.argument) {
    recurring.argument = recurring.argument[1];
    recurring.parsed = this.utils.parseTime(recurring.argument);

    if (recurring.parsed === 'INVALID' || recurring.parsed === 'SET_FOR_PAST' || recurring.parsed.mode !== 'relative') {
      return `I was unable to recognize \`${recurring.argument}\` as a valid recurring time argument. Please enter a proper recurring time argument, e.g. \`every 12 hours\` or \`every month\`.`;
    }

    recurring.parsed = recurring.parsed.relative;
  }

  await this.db.addReminder({
    ownerID: msg.author.id,
    dueDate: parsedTime.absolute,
    reminder,
    channelID,
    recurring: recurring.parsed
  });

  const fields = [
    {
      name: 'Target channel',
      value: channelID ? `<#${channelID}>` : `<@${msg.author.id}>'s DMs`,
      inline: true
    }
  ];

  if (recurring.argument) {
    fields.push({
      name: 'Recurring',
      value: `${recurring.argument.trim()} (every ${this.utils.parseDuration(recurring.parsed / 1000)})`,
      inline: true
    });
  }

  msg.addReaction('☑');
  return {
    title: 'Reminder successfully added',
    description: reminder,
    fields,
    footer: { text: 'Reminder set for ' },
    timestamp: new Date(parsedTime.absolute)
  };
}

module.exports = remindmeWithArgs;
