[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ccbde6fcb76f489fbf5b66970ffe9757)](https://www.codacy.com/app/Aetheryx/remindme?utm_source=github.com&utm_medium=referral&utm_content=Aetheryx/remindme&utm_campaign=badger)
# RemindMeBot [![Build Status](https://travis-ci.org/Aetheryx/remindme.svg?branch=master)](https://travis-ci.org/Aetheryx/remindme)

My own attempt at porting the famous RemindMeBot from Reddit to Discord; but better.

## Getting started

RemindMeBot is written for Node.js, so install that for your OS ([click](https://nodejs.org/en/download/)) and get Node Package Manager (`npm`) to go with it.
For Node I'm always working in the current build (7.8 at the time of writing) so I recommend you keep up, but anything above v7.0 should do.

To get started, make sure you have `git` installed on your machine, and then run `git clone https://github.com/Aetheryx/remindme.git`. This will create a new directory with all of the files and directories you need; move into it.

Start by editing your [settings.json](https://github.com/Aetheryx/remindme/blob/master/storage/settings-example.json) file to include your bot token and all of the other information in the file. Also, edit the file name to `settings.json`
After making sure `node` and `npm` are ready to go, make sure you're running a command prompt from the directory where the files are, and run:
```
npm install
```
Now the bot should be fully installed!

At this point, all you have to do is start the bot:
```
npm start
```

Feel free to make an issue on GH or add me on Discord (Aetheryx#2222) for any questions.

Special thanks to CrimsonXV, fer22f, Melmsie, Samoxive, and rgoliviera.
