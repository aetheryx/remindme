async function prefixCommand (Bot, msg, args) {
  if (msg.channel.type !== 0) {
    return Bot.sendMessage(msg.channel.id, 'Custom prefixes are not supported in DMs.');
  }

  const prefix = await Bot.db.getPrefix(msg.channel.guild.id);

  if (!args[0]) {
    return Bot.sendMessage(msg.channel.id, `The prefix in this server is \`${prefix}\`.`);
  }

  if (!msg.member.permission.has('manageGuild')) {
    return Bot.sendMessage(msg.channel.id, 'You are not authorized to use this command.');
  }

  if (args.join(' ').length > 32) {
    return Bot.sendMessage(msg.channel.id, 'Your prefix cannot be longer than 32 characters.');
  }

  await Bot.db.setPrefix(msg.channel.guild.id, args.join(' '));
  Bot.sendMessage(msg.channel.id, `Prefix successfully set to \`${args.join(' ')}\` for this server.`);
}

module.exports = {
  call: prefixCommand,
  name: 'prefix',
  usage: '{command} <new prefix>',
  aliases: ['setprefix'],
  description: 'Changes your prefix to the given argument.'
};