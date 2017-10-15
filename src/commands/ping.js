exports.run = async function (Bot, msg) {
    Bot.sendMessage(msg.channel.id, `:ping_pong: Pong! ${msg.channel.guild.shard.latency.toFixed()}ms`);
};

exports.props = {
    name        : 'ping',
    usage       : '{command}',
    aliases     : [],
    description : 'Pong!'
};