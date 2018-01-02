async function remindmeArgless (msg) {
  const prefix = this.db.getPrefix(msg.channel.guild ? msg.channel.guild.id : null);

  const delarray = [];
  const cleanup = async () => {
    if (msg.channel.type === 0 && msg.channel.permissionsOf(this.client.user.id).has('manageMessages')) {
      msg.channel.deleteMessages(delarray);
    }
  };

  delarray.push(msg.id);

  const collector = new this.utils.MessageCollector(
    this.client,
    msg.channel,
    (message) => message.author.id === msg.author.id,
    { time: 60000 }
  );
  let step = 1;
  const reminder = { ownerID: msg.author.id };

  this.sendMessage(msg.channel.id, 'What would you like the reminder to be? (You can send `cancel` at any time to cancel creation.)')
    .then(m => delarray.push(m.id));

  collector.on('message', async m => {
    if (m.content.length === 0 && !m.attachments[0]) {
      return;
    }
    if (m.content.startsWith(`${prefix}remind`) || m.content.includes(`${this.client.user.id}> remind`)) {
      cleanup();
      return collector.stop();
    }
    if (m.content.toLowerCase().includes('cancel') || m.content.toLowerCase() === 'c') {
      this.sendMessage(msg.channel.id, 'Cancelled.');
      return collector.stop();
    }

    delarray.push(m.id);

    if (step === 1) {
      reminder.reminder = m.content || m.attachments[0].proxy_url;

      this.sendMessage(msg.channel.id, 'When would you like to be reminded? (e.g. 24 hours)')
        .then(m => delarray.push(m.id));
    }

    if (step === 2) {
      const parsedTime = this.utils.parseTime(m.content);

      if (parsedTime === 'INVALID') {
        return this.sendMessage(msg.channel.id, 'Invalid time argument. When would you like to be reminded? (e.g. `12 hours` or `next week`).')
          .then(m => delarray.push(m.id));
      }
      if (parsedTime === 'SET_FOR_PAST') {
        return this.sendMessage(msg.channel.id, 'Your reminder wasn\'t added because it was set for the past. Note that if you\'re trying to set a reminder for the same day at a specific time (e.g. `6 PM`), UTC time will be assumed. You can fix this by including your timezone (e.g. `6 PM PST`).\n\nWhen would you like to be reminded? (e.g. `12 hours` or `next week`).')
          .then(m => delarray.push(m.id));
      }

      reminder.dueDate = parsedTime.absolute;

      this.sendMessage(msg.channel.id, 'Would you like to receive the reminder in a specific channel, or in your DMs?\nMention the channel you\'d like to receive the reminder in, or send `DM` if you\'d like to receive it in your DMs.')
        .then(m => delarray.push(m.id));
    }

    if (step === 3) {
      if (!m.content.toLowerCase().startsWith('dm')) {
        if (!m.channelMentions[0] && !m.content.includes('here')) {
          return this.sendMessage(msg.channel.id, 'You need to either ping the channel you\'d like to receive your reminder in, send `here` or send `DM`.\nWhere would you like to receive your reminder?')
            .then(m => delarray.push(m.id));
        }
        reminder.channelID = m.channelMentions[0] || m.channel.id;
      }

      this.sendMessage(msg.channel.id, 'Would you like this reminder to be recurring? Send how frequently (e.g. `every hour` or `every 3 weeks`) or send `n` for no.')
        .then(m => delarray.push(m.id));
    }

    if (step === 4) {
      if (!['n', 'no'].includes(m.content.toLowerCase())) {
        reminder.recurringArg = m.content;
        const parsed = this.utils.parseTime(m.content);

        if (parsed === 'INVALID' || parsed === 'SET_FOR_PAST' || parsed.mode !== 'relative') {
          return this.sendMessage(msg.channel.id, `I was unable to recognize \`${m.content}\` as a valid recurring time argument. Please enter a proper recurring time argument, e.g. \`every 12 hours\` or \`every month\`.`);
        }

        reminder.recurring = parsed.relative;
      }

      collector.stop();
      await this.db.addReminder(reminder);

      const fields = [
        {
          name: 'Target channel',
          value: reminder.channelID ? `<#${reminder.channelID}>` : `<@${msg.author.id}>'s DMs`,
          inline: true
        }
      ];

      if (reminder.recurring) {
        fields.push({
          name: 'Recurring',
          value: `${reminder.recurringArg.trim()} (every ${this.utils.parseDuration(reminder.recurring / 1000)})`,
          inline: true
        });
      }

      this.sendMessage(msg.channel.id, {
        title: 'Reminder successfully added',
        description: reminder.reminder,
        fields: fields,
        footer: { text: 'Reminder set for ' },
        timestamp: new Date(reminder.dueDate)
      });
      cleanup();
    }
    step++;
  });

  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      this.sendMessage(msg.channel.id, 'Prompt timed out.');
    }
  });
}

module.exports = remindmeArgless;