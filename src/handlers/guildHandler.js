const snekfetch = require('snekfetch');

exports.create = (Bot, guild) => {
    guild.owner.send(`Thanks for adding me to your server! To see a list of my commands, send \`${Bot.config.defaultPrefix}help\`.\nFeel free to DM Aetheryx#2222 for any questions or concerns!`);
    postStats(Bot);
};

exports.delete = async (Bot, guild) => {
    await Bot.db.run('DELETE FROM prefixes WHERE guildID = ?;', guild.id);
    Bot.prefixes.delete(guild.id);
    postStats(Bot);
};

function postStats (Bot) {
    Bot.botlists.forEach((token, url) => {
        if (url) {
            console.log(url, token);
            snekfetch
                .post(url)
                .set('Authorization', token)
                .send({ server_count: Bot.client.guilds.size })
                .end();
        }
    });
}
