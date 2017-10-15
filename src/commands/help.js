exports.run = async function (Bot, msg, args) {
    if (!args[0]) {
        const content = `To set a reminder, simply send \`${msg.channel.guild.prefix}remindme\` and follow the instructions.\n` +
            `Alternatively, you can also send \`${msg.channel.guild.prefix}remindme time_argument "message"\`, ` +
            `e.g. \`${msg.channel.guild.prefix}remindme 31 December 2017 "New Years"\`.\n` +
            `My current prefix is \`${msg.channel.guild.prefix}\`, but you can also mention me as a prefix.\nHere's a list of my commands:`;
        Bot.sendMessage(msg.channel.id, { content, embed: {
            color: Bot.config.embedColor,
            description: filterCommands(Bot.commands)
        }});
    } else {
        if (Bot.commands.has(args[0]) || Bot.aliases.has(args[0])) {
            const props = Bot.commands.has(args[0]) ? Bot.commands.get(args[0]).props : Bot.commands.get(Bot.aliases.get(args[0])).props;
            Bot.sendMessage(msg.channel.id, { embed: {
                title: `Help for command: ${props.name}`,
                color: Bot.config.embedColor,
                fields: [
                    { 'name': 'Description: ', 'value': props.description, inline: false },
                    { 'name': 'Usage: ', 'value': `${'```'}\n${props.usage.replace('{command}', msg.channel.guild.prefix + props.name)}${'```'}`, inline: false },
                    { 'name': 'Aliases: ', 'value': props.aliases[0] ? props.aliases.join(', ') : 'None', inline: false }
                ]
            }});
        }
    }
};

exports.props = {
    name        : 'help',
    usage       : '{command} [command]',
    aliases     : ['command'],
    description : 'TODO'
};

function filterCommands (commands) {
    const items = [];
    for (const [key, command] of commands) {
        if (!command.props.ownerOnly) {
            items.push(key);
        }
    }
    return items.join(', ');
}