async function rebootCommand (Bot, msg) {
  await Bot.sendMessage(msg.channel.id, 'Restarting...');
  await Bot.client.disconnect({ reconnect: false });
  await Bot.dbClient.close();
  process.exit();
}

module.exports = {
  call: rebootCommand,
  name: 'reboot',
  aliases: ['restart'],
  ownerOnly: true,
  description: 'Bot owner only.',
};