const guildHandler = require('./handlers/guildHandler.js');
const msgHandler   = require('./handlers/msgHandler.js');
const dmHandler    = require('./handlers/dmHandler.js');

Discord  = require('discord.js');
client   = new Discord.Client({ disabledEvents: ['CHANNEL_PINS_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_STATE_UPDATE', 'TYPING_START', 'VOICE_SERVER_UPDATE', 'RELATIONSHIP_ADD', 'RELATIONSHIP_REMOVE', 'GUILD_BAN_ADD', 'GUILD_BAN_REMOVE', 'MESSAGE_UPDATE', 'MESSAGE_DELETE_BULK', 'MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE', 'MESSAGE_REACTION_REMOVE_ALL' ] });

db       = require('./storage/reminders.json');
settings = require('./storage/settings.json');
prefixdb = require('./storage/prefixdb.json');

const initWebDash = require('./server.js').bind(client);

client.login(settings.keys.token);

client.on('ready', () => {
    console.log('Ready to remind people of shit they\'ve probably forgotten.');
    console.log(`Logged in as ${client.user.tag}.`);
    console.log(`Bot invite link: \nhttps://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${client.user.id}`);
});

client.once('ready', () => {
    require('./handlers/dbHandler.js').start();

    let index = 0;
    const statuses = ['in %s guilds', `${settings.defaultPrefix}help`, '@mention help'];
    setInterval(function () {
        index = (index + 1) % statuses.length;
        this.user.setGame(statuses[index].replace('%s', client.guilds.size));
    }.bind(client), 10000);
    initWebDash();
});

client.on('guildCreate', (guild) => {
    guildHandler.create(guild);
});

client.on('guildDelete', (guild) => {
    guildHandler.delete(guild);
});

client.on('message', (msg) => {
    if (msg.author.bot) return;

    if (msg.content.toLowerCase().startsWith(settings.defaultPrefix) && msg.channel.type === 'dm') {
        try {
            dmHandler.run(msg);
        } catch (e) {
            console.log(e);
            return msg.channel.send('Something went wrong while executing this command. The error has been logged. \nPlease join here (discord.gg/TCNNsSQ) if the issue persists.');
        }
        return;
    }

    if (msg.channel.type !== 'dm') {
        if (!prefixdb[msg.guild.id])
            prefixdb[msg.guild.id] = settings.defaultPrefix;
        if (!msg.content.startsWith(prefixdb[msg.guild.id]) && !msg.isMentioned(client.user.id))
            return;
        try {
            msgHandler.run(msg);
        } catch (e) {
            console.log(e);
            return msg.channel.send('Something went wrong while executing this command. The error has been logged. \nPlease join here (discord.gg/TCNNsSQ) if the issue persists.');
        }
    }
});

client.on('error', console.error);
client.on('warn', console.warn);


function initWebDashboard () {
    app.listen(80, () => {
        console.log('Listening on port 80.');
    });

    app.use(express.static('dashboard'));

    app.get('/api/stats', (req, res) => {
        res.send(JSON.stringify({g:client.guilds.size,c:client.channels.filter(c => c.type === 'text').size,u:client.users.size,p:parseInt(process.uptime().toFixed())}));
    });
}
