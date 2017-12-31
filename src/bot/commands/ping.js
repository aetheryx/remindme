async function pingCommand (msg) {
  const shard = msg.channel.guild ?
    msg.channel.guild.shard :
    this.client.shards.get(0);

  return `:ping_pong: Pong! ${shard.latency.toFixed()}ms`;
}

module.exports = {
  call: pingCommand,
  name: 'ping',
  description: 'Returns the websocket latency to Discord API.'
};