exports.run = async function (Bot, msg) {
    await Bot.sendMessage(msg.channel.id, 'Restarting...');
    await Bot.client.disconnect({ reconnect: false });
    process.exit();
};

exports.props = {
    name        : 'reboot',
    usage       : '{command}',
    aliases     : ['restart'],
    description : 'Bot owner only.',
    ownerOnly   : true
};