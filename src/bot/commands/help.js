async function helpCommand (msg, args) {
  const filteredCommands = [];
  for (const command in this.commands) {
    if (!this.commands[command].ownerOnly) {
      filteredCommands.push(command);
    }
  }

  const prefix = await this.db.getPrefix(msg.channel.guild.id);

  if (!args[0]) {
    const content = `To set a reminder, simply send \`${prefix}remindme\` and follow the instructions.\n` +
      `Alternatively, you can also send \`${prefix}remindme time_argument "message"\`, ` +
      `e.g. \`${prefix}remindme 31 December 2017 "New Years"\`.\n` +
      `My current prefix is \`${prefix}\`, but you can also mention me.\nHere's a list of my commands:`;

    return {
      content,
      embed: {
        description: filteredCommands.join(', ')
      }
    };
  } else {
    const command = this.commands[args[0]] || this.commands[Object.keys(this.commands).find(c => this.commands[c].aliases.includes(args[0]))];

    if (!command || command.ownerOnly) {
      return; // TODO: decide whether this should be a silent exit or not
    }

    return {
      title: `Help for command: ${command.name}`,
      fields: [
        { 'name': 'Description: ', 'value': command.description },
        { 'name': 'Usage: ', 'value': `${'```'}\n${command.usage.replace('{command}', prefix + command.name)}${'```'}` },
        { 'name': 'Aliases: ', 'value': command.aliases[0] ? command.aliases.join(', ') : 'None' }
      ]
    };
  }
}

module.exports = {
  call: helpCommand,
  name: 'help',
  usage: '{command} [command]',
  description: 'Returns extra documentation for a specific command (or a list of all commands).'
};