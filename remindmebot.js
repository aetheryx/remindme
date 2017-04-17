const Discord = require("discord.js"),
    client = new Discord.Client(),
    fs = require("fs"),
    moment = require("moment"),
    request = require("superagent"), // only for the bots.discord.pw API, remove if you don't need it
    db = require("./storage/reminders.json"),
    settings = require("./storage/settings.json"),
    prefixdb = require("./storage/prefixdb.json"),
    blocked = require("./storage/blocked.json");

delete require.cache[require.resolve("./storage/reminders.json")]; // ?
delete require.cache[require.resolve("./storage/prefixdb.json")]; // ?

client.login(settings.keys.token);

client.on('ready', () => {
    console.log("Ready to remind people of shit they've probably forgotten");
});

client.once('ready', () => {
    delete require.cache[require.resolve("./handlers/dbHandler.js")]
    require("./handlers/dbHandler.js").run(client, Discord, db)

    let arr = ['@mention help', 'r>help', `in ${client.guilds.size} guilds`, `in ${client.channels.size} channels`, `with ${client.users.size} users`, '@mention prefix']
    setInterval(() => {
        let tempCycle = arr[0]

        arr.splice(arr.indexOf(arr[0]), 1)
        arr.push(tempCycle)

        client.user.setGame(arr[0])
    }, 17500)
});

client.on("guildCreate", guild => {
    delete require.cache[require.resolve("./handlers/guildHandler.js")]
    require("./handlers/guildHandler.js").create(client, guild, Discord, prefixdb, settings)
});

client.on("guildDelete", guild => {
    delete require.cache[require.resolve("./handlers/guildHandler.js")]
    require("./handlers/guildHandler.js").delete(client, guild, Discord, prefixdb, settings)
});

client.on('message', msg => {

    if (msg.author.id === client.user.id || blocked.includes(msg.author.id) || msg.author.bot) return false;

    if (msg.channel.type === "dm") return msg.channel.sendMessage("RemindMeBot currently isn't supported in DMs. However, this is a feature I'm currently looking into :)") // ?

    try {
        delete require.cache[require.resolve("./handlers/msgHandler.js")]
        require("./handlers/msgHandler.js").run(client, msg, settings, Discord, blocked, moment, fs, db, prefixdb)
    } catch (e) {
        console.log(e);
        return msg.channel.send('Something went wrong while executing this command. The error has been logged. \nPlease join [here](https://discord.gg/TCNNsSQ) if the issue persists.')
    };

})
