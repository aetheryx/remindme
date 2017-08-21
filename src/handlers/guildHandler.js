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
    if (Bot.config.keys.botspw) {
        snekfetch
            .post(`https://bots.discord.pw/api/bots/${Bot.client.user.id}/stats`)
            .set('Authorization', Bot.config.keys.botspw)
            .send({ server_count: Bot.client.guilds.size })
            .end();
    }

    if (Bot.config.keys.dbots) {
        snekfetch
            .post(`https://discordbots.org/api/bots/${Bot.client.user.id}/stats`)
            .set('Authorization', Bot.config.keys.dbots)
            .send({ server_count: Bot.client.guilds.size })
            .end();
    }
}
