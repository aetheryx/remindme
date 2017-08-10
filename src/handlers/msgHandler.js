const os = require('os');
const moment = require('moment');
const botVersion = require('../../package.json').version;
const { version } = require('discord.js');

require('moment-duration-format');

module.exports = async function (Bot, msg) {
    const prefix = await Bot.db.get('SELECT * FROM prefixes WHERE guildID = ?', msg.guild.id) || Bot.config.defaultPrefix;
    const command = msg.content.toLowerCase().slice(prefix.length).split(' ')[0];
    const args = msg.content.split(' ').slice(1);
    const isCommand = (commands) => {
        if (!Array.isArray(commands)) {
            commands = [commands];
        }
        return commands.includes(command) && msg.content.startsWith(prefix) ||
        msg.isMentioned(Bot.client.user.id) && commands.some(word => msg.content.toLowerCase().includes(word));
    };

    if (isCommand('ping')) {
        msg.channel.send(`:ping_pong: Pong! ${Bot.client.ping.toFixed()}ms`);
    }

    if (isCommand('invite')) {
        msg.channel.send({ embed: {
            color: Bot.config.embedColor,
            description: `Click [here](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${this.client.user.id}) to invite me to your server, or click [here](https://discord.gg/Yphr6WG) for an invite to RemindMeBot\'s support server.`
        }});
    }

    if (isCommand(['stats', 'info'])) {
        msg.channel.send({ embed: {
            color: Bot.config.embedColor,
            title: `RemindMeBot ${botVersion}`,
            url: 'http://remindmebot.xyz',
            fields: [
                { name: 'Guilds',      value: Bot.client.guilds.size, inline: true },
                { name: 'Uptime',      value: moment.duration(process.uptime(), 'seconds').format('dd:hh:mm:ss'), inline: true },
                { name: 'Ping',        value: `${Bot.client.ping.toFixed()} ms`, inline: true },
                { name: 'RAM Usage',   value: `${(process.memoryUsage().rss / 1048576).toFixed()}MB/${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)} GB` : `${(os.totalmem() / 1048576).toFixed()} MB`)}
(${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%)`, inline: true },
                { name: 'System Info', value: `${process.platform} (${process.arch})\n${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)} GB` : `${(os.totalmem() / 1048576).toFixed(2)} MB`)}`, inline: true },
                { name: 'Libraries',   value: `[Discord.js](https://discord.js.org) v${version}\n[Node.js](https://nodejs.org/en/) ${process.version}`, inline: true },
                { name: 'Links',       value: '[Bot invite](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=290947970457796608) | [Support server invite](https://discord.gg/Yphr6WG) | [GitHub](https://github.com/Aetheryx/remindme) | [Website](http://remindmebot.xyz)' },
            ],
            footer: { text: 'Created by Aetheryx#2222' }
        }});
    }
};

