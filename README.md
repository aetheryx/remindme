# RemindMeBot 

[![Build Status](https://travis-ci.org/Aetheryx/remindme.svg?branch=master)](https://travis-ci.org/Aetheryx/remindme)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ccbde6fcb76f489fbf5b66970ffe9757)](https://www.codacy.com/app/Aetheryx/remindme?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Aetheryx/remindme&amp;utm_campaign=Badge_Grade)
[![GitHub release](https://img.shields.io/github/release/Aetheryx/remindme.svg)](https://github.com/Aetheryx/remindme/releases)
[![License](https://img.shields.io/github/license/aetheryx/remindme.svg)](https://github.com/Aetheryx/remindme/blob/master/LICENSE)
[![Discord](https://img.shields.io/discord/299979631715549184.svg)](https://discord.gg/Yphr6WG)
[![issues](https://img.shields.io/github/issues/aetheryx/remindme.svg)](https://github.com/aetheryx/remindme/issues)
[![prs](https://img.shields.io/github/issues-pr/aetheryx/remindme.svg)](https://github.com/aetheryx/remindme/pulls)

# Notice
This project has been discontinued alongside the RemindMe Discord bot. You may use this repo to run your own version of the discord bot (at your own risk and without help).

## Getting started

Make sure you have `git` and `node` (latest is preferred) installed on your machine. <sup>Side note - if your version of Node is below 7.6, you need to run with a `--harmony` flag.</sup>

Clone the repo, go into it, npm install:
```
git clone https://github.com/Aetheryx/remindme.git folderName
cd folderName
npm install
```

Fill in your config file (`src/config-example.json`) with all of the keys and settings:
```js
{
  "defaultPrefix": "", // Default prefix for the bot
  "embedColor": 16777215, // The embed color for all of the embeds that the bot returns, in base10
  "ownerID": "", // ID of the owner of the bot. Gives you access to eval / bash commands
  "tick": 3000, // The tick of the interval at which the bot checks for reminders that are due. Don't put this too low or it'll start sending double reminders
  "webserver": {
    "enabled": true, // Whether the webserver should run or not
    "port": 8080 // The port at which the webserverw would run
  },
  "keys": {
    "token": "", // Your bot token
    "dbl": "", // discord.bots.org token, leave empty if you don't have one
    "botspw": "", // bots.discord.pw token, leave empty if you don't have one
    "novo": "" // novo token, leave empty if you don't have one
  },
  "disabledEvents": [ // Disabled websocket events. Removing items from this list is probably harmless, but adding some can fuck up things. Be careful.
    "CHANNEL_PINS_UPDATE",
    "USER_NOTE_UPDATE",
    "VOICE_STATE_UPDATE",
    "TYPING_START",
    "VOICE_SERVER_UPDATE",
    "RELATIONSHIP_ADD",
    "RELATIONSHIP_REMOVE",
    "GUILD_BAN_ADD",
    "GUILD_BAN_REMOVE", 
    "MESSAGE_UPDATE",
    "MESSAGE_DELETE_BULK",
    "MESSAGE_REACTION_ADD",
    "MESSAGE_REACTION_REMOVE",
    "MESSAGE_REACTION_REMOVE_ALL"
  ]
}

```

At this point, all you have to do is start the bot with `sudo npm start` (or `sudo pm2 start remindmebot.js`).

## License
This project is licensed under the MIT License - see the [LICENSE file](https://github.com/Aetheryx/remindme/blob/master/LICENSE) for more info. Basically, you can do whatever the fuck you like as long as you mention/credit me. Oh, and you can't sue me if it blows up.
