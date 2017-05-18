const msgHandler   = require('./handlers/msgHandler.js');
const guildHandler = require('./handlers/guildHandler');
Discord  = require('discord.js');
client   = new Discord.Client();
db       = require('./storage/reminders.json');
settings = require('./storage/settings.json');
prefixdb = require('./storage/prefixdb.json');

client.login(settings.keys.token);

client.on('ready', () => {
    console.log('Ready to remind people of shit they\'ve probably forgotten.');
    console.log(`Logged in as ${client.user.tag}.`);
    console.log(`Bot invite link: \nhttps://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${client.user.id}`);
});

client.once('ready', () => {
    require('./handlers/dbHandler.js').start();

    let index = 0;
    let statuses = ['in %s guilds', settings.defaultPrefix + 'help', 'with %u users', '@mention help'];

    setInterval(function() {
        index = (index + 1) % statuses.length;
        this.user.setGame(statuses[index].replace('%s', client.guilds.size).replace('%c', client.channels.size).replace('%u', client.users.size));
    }.bind(client), 10000);
});

client.on('guildCreate', (guild) => {
    guildHandler.create(guild);
});

client.on('guildDelete', (guild) => {
    guildHandler.delete(guild);
});

client.on('message', (msg) => {
    if (msg.author.bot || msg.channel.type === 'dm') return;

    if (!prefixdb[msg.guild.id])
        prefixdb[msg.guild.id] = settings.defaultPrefix;

    if (!msg.content.toLowerCase().startsWith(prefixdb[msg.guild.id]) && !msg.isMentioned(client.user.id))
        return;

    try {
        msgHandler.run(msg);
    } catch (e) {
        console.log(e);
        return msg.channel.send('Something went wrong while executing this command. The error has been logged. \nPlease join here (discord.gg/TCNNsSQ) if the issue persists.');
    }
});

client.on('error', console.error);
client.on('warn', console.warn);
