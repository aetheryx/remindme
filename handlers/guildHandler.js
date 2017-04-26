const fs = require('fs'),
    request = require('superagent'),
    settings = require('../storage/settings.json')

exports.create = function(client, guild, prefixdb) {

    prefixdb[guild.id] = settings.defaultPrefix;

    fs.writeFile('./storage/prefixdb.json', JSON.stringify(prefixdb, '', '\t'), (err) => {
        if (err) return console.log(Date() + ' createGuildHandler error: ' + err)
        console.log(Date() + ' Prefix DB updated.')
    });

    guild.defaultChannel.sendMessage(`Hi, I'm ${client.user.toString()} and I give you the possibility to set reminders and view or delete them. To see a list of my commands, send \`${prefixdb[guild.id]}help\`.\nFeel free to dm Aetheryx#2222 for any questions or concerns!`);

    if (!settings.keys.botspw.includes('API key'))
        request
        .post('https://bots.discord.pw/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.botspw)
        .send({
            server_count: client.guilds.size
        })
        .end(() => console.log('bots.pw statistics updated, ' + client.guilds.size + ' guilds'));

    if (!settings.keys.dbots.includes('API key'))
        request
        .post('https://discordbots.org/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.dbots)
        .send({
            server_count: client.guilds.size
        })
        .end(() => console.log('DBots statistics updated, ' + client.guilds.size + ' guilds'));
};

exports.delete = function(client, guild, prefixdb) {

    delete prefixdb[guild.id];

    fs.writeFile('./storage/prefixdb.json', JSON.stringify(prefixdb, '', '\t'), (err) => {
        if (err) return console.log(Date() + ' createGuildHandler error: ' + err)
        console.log(Date() + ' Prefix DB updated.')
    });

    if (!settings.keys.botspw.includes('API key'))
        request
        .post('https://bots.discord.pw/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.botspw)
        .send({
            server_count: client.guilds.size
        })
        .end(() => console.log('bots.pw statistics updated, ' + client.guilds.size + ' guilds'));

    if (!settings.keys.dbots.includes('API key'))
        request
        .post('https://discordbots.org/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.dbots)
        .send({
            server_count: client.guilds.size
        })
        .end(() => console.log('DBots statistics updated, ' + client.guilds.size + ' guilds'));
};
