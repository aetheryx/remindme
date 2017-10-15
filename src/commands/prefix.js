exports.run = async function (Bot, msg, args) {
    if (msg.channel.type !== 0) {
        return Bot.sendMessage(msg.channel.id, 'Custom prefixes are currently not supported in DMs.');
    }
    if (!args[0]) {
        return Bot.sendMessage(msg.channel.id, `The prefix in this server is \`${msg.channel.guild.prefix}\`.`);
    }
    if (!msg.member.permission.has('manageGuild')) {
        return Bot.sendMessage(msg.channel.id, 'You are not authorized to use this command.');
    }
    if (args.join(' ').length > 32) {
        return Bot.sendMessage(msg.channel.id, 'Your prefix cannot be longer than 32 characters.');
    }
    msg.channel.guild.prefix = args.join(' ');
    Bot.sendMessage(msg.channel.id, `Prefix successfully set to \`${args.join(' ')}\` for this server.`);
};

exports.props = {
    name        : 'prefix',
    usage       : '{command} <desired prefix>',
    aliases     : ['setprefix'],
    description : 'Changes your prefix to the given argument.'
};