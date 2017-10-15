const messageCollector = require('./utils/messageCollector.js');
const validateConfig   = require('./utils/validateConfig.js');
const guildHandler     = require('./handlers/guildHandler.js');
const botPackage       = require('../package.json');
const handleMsg        = require('./handlers/msgHandler.js');
const Eris             = require('eris');
const fs               = require('fs');

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
        this.client = new Eris(this.config.keys.token,
            Object.assign({}, this.defaultClientOptions, this.config.clientOptions || {}));
        this.db = require('sqlite');

        this.commands = new Map();
        this.aliases = new Map();
        this.loadCommands();

        this.client
            .on('connect', this.onShardConnect.bind(this))
            .on('messageCreate', this.onMessage.bind(this))
            .on('ready', this.onReady.bind(this))
            .on('guildCreate', guild => guildHandler.create(this, guild))
            .on('guildDelete', guild => guildHandler.delete(this, guild))
            .once('ready', this.start.bind(this));

        this.client.connect();
    }

    async onShardConnect (id) {
        this.log(`Shard ${id} successfully initiated.`);
    }

    async onReady () {
        this.prefixRX = new RegExp(`<@!*${this.client.user.id}>`);
        this.tokenRegex = new RegExp(this.config.keys.token, 'gi');
        this.log(`Logged in as ${this.client.user.username}.
        Bot invite link: https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${this.client.user.id}`);
    }

    async start () {
        await this.initDB();
        await this.loadPrefixes();
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
            this.editStatus('online', {
                name: statuses[index].replace('%s', this.guilds.size)
            });
        }.bind(this.client), 8000);

        this.botlists = new Map([
            [`https://novo.archbox.pro/api/bots/${this.client.user.id}`, this.config.keys.novo],
            [`https://discordbots.org/api/bots/${this.client.user.id}/stats`, this.config.keys.dbl],
            [`https://bots.discord.pw/api/bots/${this.client.user.id}/stats`, this.config.keys.botspw],
        ]);
    }

    async loadCommands () {
        fs.readdir(`${__dirname}/commands/`, (err, files) => {
            if (err) {
                return this.log(err.stack, 'error');
            }
            this.log(`Loading a total of ${files.length} commands.`);

            files.forEach(file => {
                const command = require(`${__dirname}/commands/${file}`);
                if (!command.props) {
                    return;
                }
                this.commands.set(command.props.name, command);

                command.props.aliases.forEach(alias => this.aliases.set(alias, command.props.name));
            });
        });
    }

    async initDB () {
        await this.db.open(require('path').join(process.env.HOME || process.env.USERPROFILE || __dirname, 'rmb.database'));
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
    }

    async loadPrefixes () {
        const _this = this;
        const prefixes = new Map();

        await this.db.each('SELECT * FROM prefixes', (err, row) => {
            prefixes.set(row.guildID, row.prefix);
        });

        Object.defineProperty(Eris.Guild.prototype, 'prefix', { // A new concept I'm playing with.. might not be around for ever, so calm your tits :^)
            get: function () {
                return prefixes.get(this.id) || _this.config.defaultPrefix;
            },
            set: async function (newPrefix) {
                if (prefixes.has(this.id)) {
                    _this.db.run('UPDATE prefixes SET prefix = ? WHERE guildID = ?;', newPrefix, this.id);
                } else {
                    _this.db.run('INSERT INTO prefixes (guildID, prefix) VALUES (?, ?);', this.id, newPrefix);
                }
                prefixes.set(this.id, newPrefix);
            }
        });


        Eris.Channel.prototype.awaitMessages = function (filter, options) {
            const collector = new messageCollector(this, filter, options);
            return new Promise(resolve => {
                collector.on('end', (collected, reason) => {
                    resolve([collected, reason]);
                });
            });
        };
    }

    async onMessage (msg) {
        if (msg.author.bot) {
            return;
        }

        try {
            if (!msg.channel.guild) {
                msg.channel.guild = { prefix: this.config.defaultPrefix };
            }
            await handleMsg(this, msg);
        } catch (err) {
            msg.channel.createMessage('Something went wrong while executing this command. The error has been logged. \nPlease join here (<https://discord.gg/Yphr6WG>) if the issue persists.');
            this.log(err.stack, 'error');
        }
    }

    async sendMessage (target, content, isUser = false) {
        try {
            if (isUser) {
                const DMChannel = await this.client.getDMChannel(target);
                return await DMChannel.createMessage(content);
            } else {
                return await this.client.createMessage(target, content);
            }
        } catch (err) {
            if (!err.message.includes('Missing Permissions') && !err.message.includes('Cannot send messages to this user')) {
                this.log(err.stack);
            } else {
                return false;
            }
        }
    }

    get package () {
        return botPackage;
    }

    get defaultClientOptions () {
        return {
            disableEveryone: true,
            maxShards: 'auto',
            messageLimit: 10,
            disableEvents: {
                CHANNEL_PINS_UPDATE: true,
                USER_SETTINGS_UPDATE: true,
                USER_NOTE_UPDATE: true,
                RELATIONSHIP_ADD: true,
                RELATIONSHIP_REMOVE: true,
                GUILD_BAN_ADD: true,
                GUILD_BAN_REMOVE: true,
                TYPING_START: true,
                MESSAGE_UPDATE: true,
                MESSAGE_DELETE: true,
                MESSAGE_DELETE_BULK: true,
                VOICE_STATE_UPDATE: true
            }
        };
    }
}

new RMB();