const Discord = require("discord.js"),
    client = new Discord.Client(),
    time = require("time-parser"),
    fs = require("fs"),
    moment = require("moment"),
    request = require("superagent"), // only for the bots.discord.pw API, remove if you don't need it
    db = require("./reminders.json"),
    settings = require("./settings.json"),
    prefixdb = require("./prefixdb.json"),
    blocked = require("./blocked.json");

delete require.cache[require.resolve("./reminders.json")]; // ?
delete require.cache[require.resolve("./prefixdb.json")]; // ?

require("moment-duration-format");

client.login(settings.keys.token);

client.on('ready', () => {
    console.log("Ready to remind people of shit they've probably forgotten");
    client.user.setGame(settings.defaultPrefix + "help");
});


client.on("message", msg => {

    if (msg.author.id === client.user.id || blocked.includes(msg.author.id) || msg.author.bot) return false;

    if (msg.channel.type === "dm") return msg.channel.sendMessage("RemindMeBot currently isn't supported in DMs. However, this is a feature I'm currently looking into :)") // ?

    if (!prefixdb[msg.guild.id]) prefixdb[msg.guild.id] = settings.defaultPrefix;

    if (msg.isMentioned(client.user.id) && msg.content.toLowerCase().includes("prefix")) return msg.channel.sendMessage(`My prefix in this guild is \`${prefixdb[msg.guild.id]}\`.`)

    if (msg.isMentioned(client.user.id) && msg.content.toLowerCase().includes("help")) return msg.channel.sendMessage(`To set a reminder, simply send \`${prefixdb[msg.guild.id]}remindme\` and follow the instructions. Alternatively, you can also send \`${prefixdb[msg.guild.id]} <time argument> "<message>"\`. \nMy prefix is \`${prefixdb[msg.guild.id]}\`; here's a list of my commands:`, {
        embed: new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setDescription("remindme, list, clear, prefix, stats, ping, help, invite".split(", ").sort().join(", "))
    });

    if (!msg.content.toLowerCase().startsWith(prefixdb[msg.guild.id])) return false;

    const cmd = msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length).split(" ")[0];

    if (cmd === "reboot" || cmd === "restart") {
        if (msg.author.id !== settings.ownerID) return msg.reply("You do not have permission to use this command.")
        msg.channel.sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription("Rebooting..."))
            .then(() => process.exit());
        return;
    };

    if (cmd === "invite") return msg.channel.sendEmbed(new Discord.RichEmbed()
        .setColor(settings.embedColor)
        .setDescription("[Invite me to your server!](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=290947970457796608)"));

    if (cmd === "block") { // test write
        if (msg.author.id !== settings.ownerID) return msg.reply("You do not have permission to use this command.");
        if (msg.mentions.users.size === 0) return msg.channel.sendMessage("No users mentioned.");
        blocked.push(msg.mentions.users.first().id);
        fs.writeFile("./blocked.json", JSON.stringify(blocked, "", "\t"), (err) => {
            if (err) return false;
            msg.channel.sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription(`${msg.mentions.users.first().username} successfully blocked`)
            );
        });
        return;
    };

    if (cmd === "unblock") { // test write
        if (msg.author.id !== settings.ownerID) return msg.reply("You do not have permission to use this command.");
        if (msg.mentions.users.size === 0) return msg.channel.sendMessage("No users mentioned.");
        blocked.splice(blocked.indexOf(msg.mentions.users.first().id), 1);
        fs.writeFile("./blocked.json", JSON.stringify(blocked, "", "\t"), (err) => {
            if (err) return false;
            msg.channel.sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription(`${msg.mentions.users.first().username} successfully unblocked`)
            );
        });
        return;
    };

    if (cmd === "stats" || cmd === "info") {
        let os = require("os"),
            embed = new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setTitle(`RemindMeBot ${settings.version}`)
            .setURL("https://github.com/Aetheryx/remindme")
            .addField("Guilds", client.guilds.size, true)
            .addField("Uptime", moment.duration(process.uptime(), "seconds").format("dd:hh:mm:ss"), true)
            .addField("Ping", `${(client.ping).toFixed(0)} ms`, true)
            .addField("RAM Usage", `${(process.memoryUsage().rss / 1048576).toFixed()}MB/${(os.totalmem() > 1073741824 ? (os.totalmem() / 1073741824).toFixed(1) + " GB" : (os.totalmem() / 1048576).toFixed() + " MB")} (${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%)`, true)
            .addField("System Info", `${process.platform} (${process.arch})\n${(os.totalmem() > 1073741824 ? (os.totalmem() / 1073741824).toFixed(1) + " GB" : (os.totalmem() / 1048576).toFixed(2) + " MB")}`, true)
            .addField("Libraries", `[Discord.js](https://discord.js.org) v${Discord.version}\nNode.js ${process.version}`, true)
            .setFooter("Created by Aether#2222");
        return msg.channel.sendEmbed(embed);
    };

    if (cmd === "ping") return msg.channel.sendEmbed(new Discord.RichEmbed()
        .setColor(settings.embedColor)
        .setDescription(`:ping_pong: Pong! ${client.pings[0]}ms`));

    if (cmd === "ev") { // test write
        if (msg.author.id !== settings.ownerID) return false;
        let script = msg.content.substring(prefixdb[msg.guild.id].length + 3, msg.content.length);
        try {
            let code = eval(script);
            if (typeof code !== 'string')
                code = require('util').inspect(code, {
                    depth: 0
                });
            code = code.replace(new RegExp(client.user.email, "gi"), "git gud").replace(new RegExp(client.token, "gi"), "git gud");
            msg.channel.sendMessage(script + "\n```xl\n" + code + "\n```");
        } catch (e) {
            msg.channel.sendMessage(script + "\n`ERROR` ```xl\n" + e + "\n```");
        };
        return;
    };

    if (cmd === "help") return msg.channel.sendMessage(`To set a reminder, simply send \`${prefixdb[msg.guild.id]}remindme\` and follow the instructions. Alternatively, you can also send \`${prefixdb[msg.guild.id]} <time argument> "<message>"\`. \nMy prefix is \`${prefixdb[msg.guild.id]}\`; here's a list of my commands:`, {
        embed: new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setDescription("remindme, list, clear, prefix, stats, ping, help, invite".split(" ").sort().join(", "))
    });

    if (cmd === "reminders" || cmd === "list") {
        if (!db[msg.author.id] || db[msg.author.id].length === 0) return msg.reply("You have no reminders set!");
        client.users.get(msg.author.id).sendEmbed(new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .addField(`Current reminder${(db[msg.author.id].length > 1 ? "s" : "")}:`, db[msg.author.id].map(r => r.reminder).join("\n"))
            .setFooter(`Reminder${(db[msg.author.id].length > 1 ? "s" : "")} set to expire in(dd:hh:mm:ss): ${db[msg.author.id].map(b => moment.duration(b.when - Date.now(), "milliseconds").format("dd:hh:mm:ss")).join(', ')}`)).then(() => {
            msg.channel.sendMessage(":ballot_box_with_check: Check your DMs!");
        }).catch(err => {
            if (err.message === "Forbidden")
                msg.channel.sendEmbed(new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .addField(`Current reminder${(db[msg.author.id].length > 1 ? "s" : "")}:`, db[msg.author.id].map(r => r.reminder).join("\n"))
                    .setFooter(`Reminder${(db[msg.author.id].length > 1 ? "s" : "")} set to expire in(dd:hh:mm:ss): ${db[msg.author.id].map(b => moment.duration(b.when - Date.now(), "milliseconds").format("dd:hh:mm:ss")).join(', ')}`));
        });
        return;
    };

    if (cmd === "clear" || cmd === "delete") {
        let delarray = [];
        if (!db[msg.author.id] || db[msg.author.id].length === 0) return msg.reply("You have no reminders set!")
        delarray.push(msg)
        msg.channel.sendMessage(":warning: This will delete all of your reminders! Are you sure? (`y`/`n`)").then(a => delarray.push(a))
        const collector = msg.channel.createCollector(m => msg.author.id === m.author.id, {
            time: 25000
        })

        collector.on("message", m => {
            if (m.content.toLowerCase() === "y" || m.content.toLowerCase() === "yes") {
                delarray.push(m)
                db[msg.author.id] = [];
                fs.writeFile("./reminders.json", JSON.stringify(db, "", "\t"), (err) => {
                    if (err) return msg.channel.sendMessage("Your reminders weren't cleared.\n" + err.message);
                    msg.channel.sendMessage(":ballot_box_with_check: Reminders cleared.")
                });
                if (m.channel.permissionsFor(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray)
                return collector.stop();
            } else {
                delarray.push(m)
                msg.channel.sendMessage(":ballot_box_with_check: Cancelled.")
                if (m.channel.permissionsFor(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray)
                return collector.stop();
            };
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time") {
                if (msg.guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray);
                msg.channel.sendMessage("Prompt timed out.")
            }
        })
        return;
    };

    if (msg.content.toLowerCase() === prefixdb[msg.guild.id] + "remindme") {
        let delarray = [];
        delarray.push(msg)
        msg.channel.sendMessage("What would you like the reminder to be? (You can send `cancel` at any time to cancel creation.)")
            .then(m => delarray.push(m))
        const collector = msg.channel.createCollector(m => msg.author.id === m.author.id, {
            time: 25000
        })
        let step = 1,
            dboption = {
                "reminder": undefined,
                "when": undefined,
                "made": msg.createdTimestamp
            };
        collector.on("message", m => {
            if (m.content.toLowerCase() === "cancel") {
                delarray.push(m)
                if (m.channel.permissionsFor(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray)
                msg.channel.sendMessage("Cancelled.");
                return collector.stop();
            }
            if (m.content.toLowerCase() === prefixdb[m.guild.id] + "remindme") {
                delarray.push(m)
                if (m.channel.permissionsFor(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray)
                return collector.stop();
            }
            if (step === 1) {
                delarray.push(m)
                if (m.content.length === 0) return msg.channel.sendMessage("The reminder cannot be empty.\nWhat would you like the reminder to be?").then(a => delarray.push(a));
                dboption.reminder = m.content;
                msg.channel.sendMessage("When would you like to be reminded? (e.g. 24 hours)").then(a => delarray.push(a));
            }
            if (step === 2) {
                delarray.push(m)
                let tParse = time(m.content).absolute;
                if (m.content === "tommorow") tParse = time("24 hours").absolute;
                if (m.content.includes("next")) tParse = time(m.content.replace(/next/g, "one")).absolute;
                if (m.content.startsWith("a ")) tParse = time(m.content.replace(/a /g, "one ")).absolute;
                if (!isNaN(m.content) || !tParse) return msg.channel.sendMessage("Invalid time.\nWhen would you like to be reminded? (e.g. 24 hours)").then(a => delarray.push(a));
                if (time(m.content).relative < 0) {
                    collector.stop();
                    // if (msg.guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray);
                    return msg.channel.sendMessage("Your reminder wasn't added. \n__**ERR**: Unless you have a time machine, you can't set reminders in the past.__");
                };
                collector.stop();
                dboption.when = tParse;
                if (!db[msg.author.id]) db[msg.author.id] = [];
                db[msg.author.id].push(dboption);
                fs.writeFile("./reminders.json", JSON.stringify(db, "", "\t"), (err) => {
                    if (err) return msg.channel.sendMessage("Your reminder wasn't added.\n" + err.message);
                    msg.channel.sendEmbed(new Discord.RichEmbed()
                        .setColor(settings.embedColor)
                        .setDescription(`:ballot_box_with_check: Reminder added: ${dboption.reminder}`)
                        .setFooter(`Reminder set for `)
                        .setTimestamp(new Date(tParse))).then(() => {
                        if (msg.guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray);
                    });
                });
            };
            step++;
        });
        collector.on("end", (collected, reason) => {
            if (reason === "time") {
                if (msg.guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES")) msg.channel.bulkDelete(delarray);
                msg.channel.sendMessage("Prompt timed out.")
            }
        })
    };

    if (cmd === "prefix") {
        if (msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length + 7, msg.content.length) === "") return msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor(settings.embedColor)
            .setDescription(`The current prefix for this guild is \`${prefixdb[msg.guild.id]}\`.`))

        if (msg.author.id === msg.guild.owner.id || msg.author.id === settings.ownerID) {
            if (msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length + 7, msg.content.length).length > 16) return msg.channel.sendMessage("Please keep your prefix below 16 characters.")
            prefixdb[msg.guild.id] = msg.content.toLowerCase().substring(prefixdb[msg.guild.id].length + 7, msg.content.length)
            fs.writeFile("./prefixdb.json", JSON.stringify(prefixdb, "", "\t"), (err) => {
                if (err) return msg.channel.sendMessage("Your prefix couldn't be changed.\n" + err.message);
                msg.channel.sendEmbed(new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .setDescription(`Prefix successfully changed to \`${prefixdb[msg.guild.id]}\` for this guild.`)
                )
            })
        } else {
            return msg.channel.sendMessage("You do not have the required permissions for this command.")
        };
    };

    if (cmd === "remindme" && msg.content.length > prefixdb[msg.guild.id].length + 10) {
        if (!msg.content.includes(`"`)) return msg.channel.sendMessage("Argument error. Please follow the proper syntax for the command:\n`" + prefixdb[msg.guild.id] + " <time argument> \"<message>\"`")
        let timeArg = msg.content.substring(prefixdb[msg.guild.id].length + 9, msg.content.indexOf('"') - 1),
            tParse = time(timeArg).absolute;
        if (timeArg === "tommorow") tParse = time("24 hours").absolute;
        if (timeArg.includes("next")) tParse = time(timeArg.replace(/next/g, "one")).absolute;
        if (timeArg.startsWith("a ")) tParse = time(timeArg.replace(/a /g, "one")).absolute;
        if (!isNaN(timeArg) || !tParse) return msg.channel.sendMessage("Invalid time. Please enter a proper time argument, e.g. `12 hours` or `next week`. ")
        if (time(timeArg).relative < 0) return msg.channel.sendMessage("Your reminder wasn't added. \n__**ERR**: Unless you have a time machine, you can't set reminders in the past.__");
        let reminder = msg.content.substring(msg.content.indexOf('"') + 1, msg.content.length - 1),
            dboption = {
                "reminder": reminder,
                "when": tParse,
                "made": msg.createdTimestamp
            };
        if (!db[msg.author.id]) db[msg.author.id] = [];
        db[msg.author.id].push(dboption);
        fs.writeFile("./reminders.json", JSON.stringify(db, "", "\t"), (err) => {
            if (err) return msg.channel.sendMessage("Your reminder wasn't added.\n" + err.message);
            msg.channel.sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .setDescription(`:ballot_box_with_check: Reminder added: ${dboption.reminder}`)
                .setFooter(`Reminder set for `)
                .setTimestamp(new Date(tParse)));
        });
        return;
    }

    /*    if (cmd === "forget") {
            let delarray = [];
            if (!db[msg.author.id] || db[msg.author.id].length === 0) return msg.reply("You have no reminders set!")
            delarray.push(msg)
            msg.channel.sendMessage("Here's a list of your current reminders: ", {
                embed: new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .setTitle("Reminders")
                    .setDescription(Object.keys(db[msg.author.id]).map((e, i) => `[${i + 1}] ` + db[msg.author.id][e].reminder).join("\n"))
                    .setFooter("Send the number of the reminder you want me to forget(e.g. `3`), or send `c` to cancel.")
            }).then(m => delarray.push(m))
            const collector = msg.channel.createCollector(m => msg.author.id === m.author.id)
            collector.on("message", m => {

                if (isNaN(m.content)) return msg.channel.sendMessage("Argument entered is not a number. Send the number of the reminder you want me to forget(e.g. `3`), or send `c` to cancel.")
                if (parseInt(m.content) > Object.keys(db[msg.author.id]).length) return msg.channel.sendMessage("You don't have that many reminders, please choose a lower number.")
                let remindr = db[msg.author.id][parseInt(m.content) - 1]

                db[msg.author.id] = db[msg.author.id].filter(x => x.reminder != db[msg.author.id][parseInt(m.content) - 1].reminder)


            })
        } */

});

client.on("guildCreate", guild => {

    prefixdb[guild.id] = settings.defaultPrefix;

    fs.writeFile("./prefixdb.json", JSON.stringify(prefixdb, "", "\t"), (err) => {
        if (err) return false;
        console.log(Date() + "Prefix DB updated.")
    })

    guild.defaultChannel.sendMessage(`Hi, I'm ${client.user.toString()} and I give you the possibility to set reminders and view or delete them. To see a list of my commands, send \`${prefixdb[guild.id]}help\`.\nFeel free to dm Aether#2222 for any questions or concerns! (:`)

    // this is for the bots.discord.pw API, so you probably want to remove it if you're self hosting
    request
        .post("https://bots.discord.pw/api/bots/290947970457796608/stats")
        .set('Authorization', settings.keys.dbots)
        .send({
            server_count: client.guilds.size
        })
        .end(() => console.log("DBots statistics updated"));


});

setInterval(() => {

    let expired = {};

    Object.keys(db).map(x => {
        let temp = db[x].filter(r => Date.now() >= r.when);
        if (temp.length === 0) return false;
        expired[x] = temp;
    })

    if (Object.keys(expired).length === 0) return false;

    Object.keys(expired).map(e => {
        if (expired[e].length > 1) {
            client.users.get(e).sendEmbed(new Discord.RichEmbed()
                    .setColor(settings.embedColor)
                    .addField(`Reminder${(expired[e].length > 1 ? "s" : "")}:`, expired[e].map(r => r.reminder).join("\n"))
                    .setFooter(`Reminder${(expired[e].length > 1 ? "s" : "")} set on: ${expired[e].map(b => moment.utc(b.made).format("DD/MM/YYYY | H:mm:ss")).join(', ')} UTC`))
                .catch(e => console.log(e));
        } else {
            client.users.get(e).sendEmbed(new Discord.RichEmbed()
                .setColor(settings.embedColor)
                .addField("Reminder:", expired[e].map(r => r.reminder).join("\n"))
                .setFooter("Reminder set on ")
                .setTimestamp(new Date(expired[e][0].made))
            ).catch(e => console.log(e.message));
        };

        db[e] = db[e].filter(r => Date.now() <= r.when);
    });

    fs.writeFile("./reminders", JSON.stringify(db, "", "\t"), (err) => {
        if (err) return false;
        console.log(Date() + "DB updated.")
    });
}, 3000);
