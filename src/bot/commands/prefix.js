async function prefixCommand (msg, args) {
  if (msg.channel.type !== 0) {
    return 'Custom prefixes are not supported in DMs.';
  }

  const prefix = await this.db.getPrefix(msg.channel.guild.id);

  if (!args[0]) {
    return `The prefix in this server is \`${prefix}\`.`;
  }

  if (!msg.member.permission.has('manageGuild')) {
    return 'You are not authorized to use this command.';
  }

  await this.db.setPrefix(msg.channel.guild.id, args.join(' '));
  return `Prefix successfully set to \`${args.join(' ')}\` for this server.`;
}

module.exports = {
  command: prefixCommand,
  name: 'prefix',
  usage: '{command} <new prefix>',
  aliases: ['setprefix'],
  description: 'Changes your prefix to the given argument.'
};