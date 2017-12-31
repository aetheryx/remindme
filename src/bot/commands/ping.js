async function pingCommand (Bot, msg) {
  const shard = msg.channel.guild ?
    msg.channel.guild.shard :
    Bot.client.shards.get(0);

  Bot.sendMessage(msg.channel.id, {
    content: `:ping_pong: Pong! ${shard.latency.toFixed()}ms`
  });
}

module.exports = {
  call: pingCommand,
  name: 'ping',
  description: 'Returns the websocket latency to Discord API.'
};