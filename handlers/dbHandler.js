exports.start = function() {
    setInterval(() => {
        let expired = {};

        Object.keys(db).filter(u => client.users.get(u)).map(x => {
            let temp = db[x].filter(r => Date.now() >= r.when);
            if (temp.length === 0) return;
            expired[x] = temp;
        });

        if (Object.keys(expired).length === 0) return;

        Object.keys(expired).map(e => {
            let toSend = new Discord.RichEmbed().setColor(settings.embedColor);
            if (expired[e].length > 1) {
                toSend.addField(`Reminder${(expired[e].length > 1 ? 's' : '')}:`, expired[e].map(r => r.reminder).join('\n'));
                toSend.setFooter(`Reminder${(expired[e].length > 1 ? 's' : '')} set on: ${expired[e].map(b => moment.utc(b.made).format('DD/MM/YYYY | H:mm:ss')).join(', ')} UTC`);

                client.users.get(e).send({ embed: toSend }).catch(console.warn);

            } else {
                toSend.addField('Reminder:', expired[e].map(r => r.reminder).join('\n'));
                toSend.setFooter('Reminder set on ');
                toSend.setTimestamp(new Date(expired[e][0].made));

                client.users.get(e).send({ embed: toSend }).catch(console.warn);
            };
            db[e] = db[e].filter(r => Date.now() <= r.when);
        });

        fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
            if (err) return console.log(Date() + ' dbHandler error: ' + err);
        });

    }, 3000);
};
