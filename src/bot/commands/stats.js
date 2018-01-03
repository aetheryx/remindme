const os = require('os');
const totalMem = os.totalmem();
const erisVersion = require(`${__dirname}/../../../node_modules/eris/package.json`).version;
const botVersion = require(`${__dirname}/../../../package.json`).version;

async function statsCommand (msg) {
  const memUsage = process.memoryUsage().rss;
  const shard = msg.channel.guild ?
    msg.channel.guild.shard :
    this.client.shards.get(0);

  return {
    title: `RemindMeBot ${botVersion}`,
    url: 'http://remindmebot.xyz',
    fields: [
      { name: 'Guilds', value: this.client.guilds.size, inline: true },
      { name: 'Uptime', value: this.utils.parseDuration(process.uptime()), inline: true },
      { name: 'Ping', value: `${shard.latency.toFixed()} ms`, inline: true },
      { name: 'RAM Usage', value: `${(memUsage / 1048576).toFixed()}MB/${(totalMem / 1073741824).toFixed(1)} GB\n(${(memUsage / totalMem * 100).toFixed(2)}%)`, inline: true
      },
      { name: 'System Info', value: `${process.platform} (${process.arch})\n${(totalMem > 1073741824 ? `${(totalMem / 1073741824).toFixed(1)} GB` : `${(totalMem / 1048576).toFixed(2)} MB`)}`, inline: true },
      { name: 'Libraries', value: `[Eris](https://abal.moe/Eris) v${erisVersion}\n[Node.js](https://nodejs.org/en/) ${process.version}`, inline: true },
      { name: 'Links', value: [
        `[Bot invite](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${this.client.user.id})`,
        '[Support server invite](https://discord.gg/Yphr6WG)',
        '[GitHub](https://github.com/Aetheryx/remindme)',
        '[Website](http://remindmebot.xyz)'
      ].join(' | ') },
    ],
    footer: { text: 'Created by Aetheryx#2222' }
  };
}

module.exports = {
  command: statsCommand,
  name: 'stats',
  aliases: ['info'],
  description: 'Returns information and statistics about RemindMeBot.'
};