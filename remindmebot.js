Discord  = require('discord.js')
client   = new Discord.Client()
fs       = require('fs')
moment   = require('moment')
db       = require('./storage/reminders.json')
settings = require('./storage/settings.json')
prefixdb = require('./storage/prefixdb.json')
blocked  = require('./storage/blocked.json')
sagent   = require('superagent')

client.login(settings.keys.token);

client.on('ready', () => console.log('Ready to remind people of shit they\'ve probably forgotten'));

client.once('ready', () => {
    delete require.cache[require.resolve('./handlers/dbHandler.js')]
    require('./handlers/dbHandler.js').start()

    let index = 0;
    let statuses = [`in %s guilds`, settings.defaultPrefix + 'help', `in %c channels`, 'with %u users', '@mention help'];

    setInterval(function() {
        index = (index + 1) % statuses.length;
        this.user.setGame(statuses[index].replace('%s', client.guilds.size).replace('%c', client.channels.size).replace('%u', client.users.size));
    }.bind(client), 10000);
});

client.on('guildCreate', guild => {
    delete require.cache[require.resolve('./handlers/guildHandler.js')]
    require('./handlers/guildHandler.js').create(guild);
});

client.on('guildDelete', guild => {
    delete require.cache[require.resolve('./handlers/guildHandler.js')]
    require('./handlers/guildHandler.js').delete(guild);
});

client.on('message', msg => {

    if (blocked.includes(msg.author.id) || msg.author.bot || msg.channel.type === 'dm') return;

    if (!prefixdb[msg.guild.id]) prefixdb[msg.guild.id] = settings.defaultPrefix;

    if (!msg.content.toLowerCase().startsWith(prefixdb[msg.guild.id]) && !msg.isMentioned(client.user.id)) return;

    try {
        delete require.cache[require.resolve('./handlers/msgHandler.js')];
        require('./handlers/msgHandler.js').run(msg);
    } catch (e) {
        console.log(e);
        return msg.channel.send('Something went wrong while executing this command. The error has been logged. \nPlease join here (discord.gg/TCNNsSQ) if the issue persists.');
    };
});
