module.exports = async function (Bot, msg) {
    if (msg.mentions.find(u => u.id === Bot.client.user.id) && msg.content.toLowerCase().includes('help')) {
        return Bot.commands.get('help').run(Bot, msg, []);
    }

    const match = msg.content.slice(0, 22).match(Bot.prefixRX);
    const prefix = match ? `${match[0]} ` : msg.channel.guild.prefix;
    const args = msg.content.slice(prefix.length).split(' ').filter(arg => arg.length > 0);
    let command = args.shift();

    if (Bot.commands.has(command)) {
        command = Bot.commands.get(command);
    } else if (Bot.aliases.has(command)) {
        command = Bot.commands.get(Bot.aliases.get(command));
    }

    if (command && command instanceof Object) {
        if (command.props.ownerOnly && msg.author.id !== Bot.config.ownerID) {
            return;
        }
        await command.run(Bot, msg, args);
    }
};