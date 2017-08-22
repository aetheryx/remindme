# RemindMeBot [![Build Status](https://travis-ci.org/Aetheryx/remindme.svg?branch=master)](https://travis-ci.org/Aetheryx/remindme) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/ccbde6fcb76f489fbf5b66970ffe9757)](https://www.codacy.com/app/Aetheryx/remindme?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Aetheryx/remindme&amp;utm_campaign=Badge_Grade) [![License](https://img.shields.io/github/license/aetheryx/remindme.svg)](https://github.com/Aetheryx/remindme/blob/master/LICENSE)

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
  "defaultPrefix": "abcd", // Default prefix for new guilds.
  "embedColor": 12345678, // Embed color, in base10
  "ownerID": "string", // ID of the bot owner, gives you access to eval
  "tick": 1234, // The tick of the interval at which the bot checks for expired reminders, in ms. I wouldn't put this under 1 second.
  "keys": {
    "token": "abcd", // Bot token
    "dbots": "abcd", // your bots.discord.pw token, leave empty if you don't have one
    "botspw": "abcd" // your discordbots.org token, leave empty if you don't have one
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

[wip]