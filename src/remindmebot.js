const guildHandler = require('./handlers/guildHandler.js');
const handleMsg    = require('./handlers/msgHandler.js');
const { Client }   = require('discord.js');

class RMB {
    constructor () {
        this.log = require('./utils/logger.js');
        this.config = require('./config.json');
        this.client = new Client(this.config.clientOptions);
        this.client.login(this.config.keys.token);
        this.db = require('sqlite');
        this.client.on('ready', this.onReady.bind(this));
        this.client.once('ready', this.start.bind(this));
        this.client.on('message', this.onMessage.bind(this));
        this.prefixes = new Map();
        this.client.on('guildCreate', guild => guildHandler.create(this, guild));
        this.client.on('guildDelete', guild => guildHandler.delete(this, guild));
    }

    onReady () {
        this.log(`Logged in as ${this.client.user.tag}.
        Bot invite link: https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${this.client.user.id}`);
        this.owner = this.client.users.get(this.config.ownerID);
    }

    async start () {
        await this.initDB();
        require('./utils/server.js')(this);
        require('./handlers/reminderHandler')(this);

        let index = 0;
        const statuses = [
            'in %s guilds',
            `${this.config.defaultPrefix}help`,
            '@mention help'
        ];
        setInterval(function () {
            index = (index + 1) % statuses.length;
            this.user.setGame(statuses[index].replace('%s', this.guilds.size));
        }.bind(this.client), 8000);
    }

    async initDB () {
        await this.db.open('./rmb.database'); // ./rmb.database
        await this.db.run(`CREATE TABLE IF NOT EXISTS prefixes (
            guildID TEXT,
            prefix  TEXT);`);
        await this.db.run(`CREATE TABLE IF NOT EXISTS reminders (
            owner        TEXT,
            reminderText TEXT,
            createdDate  INTEGER,
            dueDate      INTEGER,
            channelID    TEXT);`);

        await this.db.each('SELECT * FROM prefixes', (err, row) => {
            this.prefixes.set(row.guildID, row.prefix);
        });
    }

    onMessage (msg) {
        if (msg.author.bot) {
            return;
        }

        try {
            handleMsg(this, msg);
        } catch (err) {
            this.log(err, 'error');
            msg.channel.send('Something went wrong while executing this command. The error has been logged. \nPlease join here (discord.gg/TCNNsSQ) if the issue persists.');
        }
    }
}

const Bot = new RMB();

const logEvents = [
    'disconnect',
    'error',
    'warn'
];

logEvents.forEach(event => {
    Bot.client.on(event, cb => {
        Bot.log(`Event ${event} emitted: ${cb.stack || 'No errors'}`, 'info');
    });
});

process.on('unhandledRejection', err => {
    Bot.log(`Unhandled rejection: \n${err.stack}`, 'error');
});


process.on('uncaughtException', err => {
    Bot.log(`UNCAUGHT EXCEPTION: \n${err.stack}`, 'error');
});