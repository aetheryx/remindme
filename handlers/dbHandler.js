const fs = require('fs');
const moment = require('moment');
const settings = require('../storage/settings.json');

require('moment-duration-format');

exports.run = function(client, Discord, db, guild) {
    setInterval(() => {

        let expired = {};

        Object.keys(db).map(x => {
            let temp = db[x].filter(r => Date.now() >= r.when);
            if (temp.length === 0) return false;
            expired[x] = temp;
        })

        if (Object.keys(expired).length === 0) return false;

        Object.keys(expired).map(e => {
            if (client.users.get(e)) {
                if (expired[e].length > 1) {
                    client.users.get(e).sendEmbed(new Discord.RichEmbed()
                            .setColor(settings.embedColor)
                            .addField(`Reminder${(expired[e].length > 1 ? 's' : '')}:`, expired[e].map(r => r.reminder).join('\n'))
                            .setFooter(`Reminder${(expired[e].length > 1 ? 's' : '')} set on: ${expired[e].map(b => moment.utc(b.made).format('DD/MM/YYYY | H:mm:ss')).join(', ')} UTC`))
                        .catch(e => console.log(e));
                } else {
                    client.users.get(e).sendEmbed(new Discord.RichEmbed()
                        .setColor(settings.embedColor)
                        .addField('Reminder:', expired[e].map(r => r.reminder).join('\n'))
                        .setFooter('Reminder set on ')
                        .setTimestamp(new Date(expired[e][0].made))
                    ).catch(e => console.log(e.message));
                };
            }
            db[e] = db[e].filter(r => Date.now() <= r.when);
        });

        fs.writeFile('./storage/reminders.json', JSON.stringify(db, '', '\t'), (err) => {
            if (err) return console.log(Date() + ' dbHandler error: ' + err)
            console.log(Date() + 'DB updated.')
        });
    }, 3000);
}
