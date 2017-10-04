const guildHandler  = require('./handlers/guildHandler.js');
const handleMsg     = require('./handlers/msgHandler.js');
const validateConfig = require('./utils/validateConfig.js');
const { Client }    = require('discord.js');
const crypto = require('crypto');
const randomString = require('../src/utils/randomString');

// You can set how strong you want your encryption by the length of the key size.
// This will also affect performance, so we need to find a good balance.
const KEY_LENGTH_SIZE = 24;

class RMB {
    constructor () {
        this.log = require('./utils/logger.js');
        this.config = require('./config.json');
        validateConfig(this.config, (err) => {
            if (err) {
                this.log(`Invalid configuration, aborting:\n${err}`, 'error');
                process.exit(1);
            }
        });
        this.client = new Client({ disabledEvents: this.config.disabledEvents || [] });
        this.client.login(this.config.keys.token);
        this.db = require('sqlite');
        this.prefixes = new Map();
        this.client
            .on('ready', this.onReady.bind(this))
            .once('ready', this.start.bind(this))
            .on('message', this.onMessage.bind(this))
            .on('guildCreate', guild => guildHandler.create(this, guild))
            .on('guildDelete', guild => guildHandler.delete(this, guild));
    }

    async onReady () {
        this.log(`Logged in as ${this.client.user.tag}.
        Bot invite link: https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${this.client.user.id}`);
        this.owner = await this.client.fetchUser(this.config.ownerID);
    }

    async start () {
        await this.initDB();
        if (this.config.webserver && this.config.webserver.enabled) {
            require('./website/server.js')(this);
        }
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

        this.botlists = new Map([
            [`https://novo.archbox.pro/api/bots/${this.client.user.id}`, this.config.keys.novo],
            [`https://discordbots.org/api/bots/${this.client.user.id}/stats`, this.config.keys.dbl],
            [`https://bots.discord.pw/api/bots/${this.client.user.id}/stats`, this.config.keys.botspw],
        ]);
    }

    async initDB () {
        await this.db.open('./rmb.database');
        await this.db.run(`CREATE TABLE IF NOT EXISTS prefixes (
            guildID TEXT,
            prefix  TEXT);`);
        await this.db.run(`CREATE TABLE IF NOT EXISTS reminders (
            owner        TEXT,
            reminderText TEXT,
            key          VARCHAR(128),
            createdDate  INTEGER,
            dueDate      INTEGER,
            channelID    TEXT);`);

        await this.db.each('SELECT * FROM prefixes', (err, row) => {
            this.prefixes.set(row.guildID, row.prefix);
        });
    }

    async onMessage (msg) {
        if (msg.author.bot) {
            return;
        }

        try {
            await handleMsg(this, msg);
        } catch (err) {
            this.log(err, 'error');
            msg.channel.send('Something went wrong while executing this command. The error has been logged. \nPlease join here (<discord.gg/TCNNsSQ>) if the issue persists.');
        }
    }

    encrypt(stringToBeEncrypted) {
        const key = randomString(KEY_LENGTH_SIZE);
        const cipher = crypto.createCipher('aes256', key);
        let encryptedString = cipher.update(stringToBeEncrypted, 'utf8', 'hex');

        encryptedString += cipher.final('hex');

        // Here we are returning the encrypted string and also the key
        return {
            encryptedString,
            key
        };
    }
        
    decrypt(stringToBeDecrypted, key) {
        const decipher = crypto.createDecipher('aes256', key);
        let decryptedString = decipher.update(stringToBeDecrypted, 'hex', 'utf8');
        const finalDecryptedString = (decryptedString += decipher.final('utf8'));

        return finalDecryptedString;
    }
}

const Bot = new RMB();

const logEvents = [
    'disconnect',
    'error',
    'warn'
];

for (const event of logEvents) {
    Bot.client.on(event, cb => {
        Bot.log(`Event ${event} emitted: ${cb.stack || 'No errors'}`, 'info');
    });
}

process.on('unhandledRejection', err => {
    Bot.log(`UNHANDLED REJECTION: \n${err.stack}`, 'error');
});


process.on('uncaughtException', err => {
    Bot.log(`UNCAUGHT EXCEPTION: \n${err.stack}`, 'error');
});
