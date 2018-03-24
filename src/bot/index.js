const utils = require(`${__dirname}/../utils`);
const dbFunctions = require(`${__dirname}/../dbFunctions`);
const events = require(`${__dirname}/events`);
const startWebServer = require(`${__dirname}/../website`);

const { MongoClient } = require('mongodb');
const Eris = utils.loadErisMods(require('eris'));
const fs   = require('fs');

class RemindMeBot {
  constructor (config) {
    this.devMode = process.argv.find(arg => arg.includes('dev'));

    this.utils = utils;
    this.log = utils.log;

    this.config = config;
    utils.validateConfig(config)
      .catch(err => {
        this.log(`Invalid configuration, aborting:\n${err}`, 'error');
        process.exit(1);
      });

    this.commands = {};
    this.loadCommands();

    this.dbClient = null;
    this.dbConn   = null;
    this.db       = null;
    this.initDB();

    this.client = new Eris(this.config.token, this.clientOptions);
    this.client
      .on('connect', events.onConnect.bind(this))
      .on('ready', events.onReady.bind(this))
      .on('messageCreate', events.onMessageCreate.bind(this))
      .on('guildCreate', events.onGuild.onCreate.bind(this))
      .on('guildDelete', events.onGuild.onDelete.bind(this))
      .once('ready', events.onceReady.bind(this));

    this.client.connect();
  }

  async startWebServer () {
    if (this.config.webserver && this.config.webserver.enabled) {
      startWebServer.call(this);
    }
  }

  async initDB () {
    this.dbClient = await MongoClient.connect(this.config.dbURL || 'mongodb://localhost:27017')
      .catch(e => {
        this.log(`Failed to connect to MongoDB: ${e.message}\nExiting...`, 'error');
        process.exit();
      });
    this.dbConn = this.dbClient.db('remindmebot');

    this.db = {};
    for (const dbFunction in dbFunctions) {
      this.db[dbFunction] = dbFunctions[dbFunction].bind(this);
    }
  }

  async loadCommands () {
    fs.readdir(`${__dirname}/commands`, (err, files) => {
      if (err) {
        return this.log(err.stack, 'error');
      }

      let failed = 0;

      files.forEach(file => {
        try {
          const command = require(`${__dirname}/commands/${file}`);
          if (command instanceof Object && command.description) {
            this.commands[command.name] = Object.assign({
              aliases: [],
              ownerOnly: false,
              usage: '{command}'
            }, command);
          }
        } catch (err) {
          failed++;
          this.log(`Failed to load command ${file}: \n${err.stack}`, 'error');
        }
      });

      this.log(`Successfully loaded ${files.length - failed}/${files.length} commands.`);
    });
  }

  async sendMessage (target, content, isUser = false) {
    if (content instanceof Object && !content.content) {
      content = { embed: content };
    }

    if (content.embed && !content.embed.color) {
      content.embed.color = this.config.embedColor;
    }

    try {
      if (isUser) {
        const DMChannel = await this.client.getDMChannel(target);
        return await DMChannel.createMessage(content); // return await is okay here
      } else {                                        //  because we're in a try-catch
        return await this.client.createMessage(target, content);
      }
    } catch (err) {
      if (
        !err.message.includes('Missing Permissions') && // TODO: re-test these and replace these strings with HTTP codes
        !err.message.includes('Cannot send messages to this user') &&
        !err.message.includes('Missing Access') &&
        !err.message.includes('Unknown Channel')
      ) {
        this.log(`Unrecognized error: ${err.stack}\n${content}`, 'error');
      } else {
        return false;
      }
    }
  }

  get clientOptions () {
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

module.exports = RemindMeBot;
