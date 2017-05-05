exports.create = function(guild) {

    prefixdb[guild.id] = settings.defaultPrefix;

    fs.writeFile('./storage/prefixdb.json', JSON.stringify(prefixdb, '', '\t'), (err) => {
        if (err) return console.log(Date() + ' createGuildHandler error: ' + err)
    });

    guild.defaultChannel.send(`Hi, I'm ${client.user.username} and I give you the possibility to set reminders and view or delete them. To see a list of my commands, send \`${prefixdb[guild.id]}help\`.\nFeel free to dm Aetheryx#2222 for any questions or concerns!`);

    if (!settings.keys.botspw.includes('API key'))
        sagent
        .post('https://bots.discord.pw/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.botspw)
        .send({
            server_count: client.guilds.size
        })
        .end(() => {});

    if (!settings.keys.dbots.includes('API key'))
        request
        .post('https://discordbots.org/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.dbots)
        .send({
            server_count: client.guilds.size
        })
        .end(() => console.log('DBots statistics updated, ' + client.guilds.size + ' guilds'));
};

exports.delete = function(guild) {

    delete prefixdb[guild.id];

    fs.writeFile('./storage/prefixdb.json', JSON.stringify(prefixdb, '', '\t'), (err) => {
        if (err) return console.log(Date() + ' deleteGuildHandler error: ' + err)
    });

    if (!settings.keys.botspw.includes('API key'))
        sagent
        .post('https://bots.discord.pw/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.botspw)
        .send({
            server_count: client.guilds.size
        })
        .end(() => {});

    if (!settings.keys.dbots.includes('API key'))
        request
        .post('https://discordbots.org/api/bots/' + client.user.id + '/stats')
        .set('Authorization', settings.keys.dbots)
        .send({
            server_count: client.guilds.size
        })
        .end(() => console.log('DBots statistics updated, ' + client.guilds.size + ' guilds'));
};
