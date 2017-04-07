# RemindMeBot

My own attempt at porting the famous RemindMeBot from Reddit to Discord; but better.

## Getting started

RemindMeBot is written for Node.js, so install that for your OS ([click](https://nodejs.org/en/download/)) and get Node Package Manager(npm) to go with it.
For Node I'm always working in the current build (7.8 at the time of writing) so I recommend you keep up, but anything above v7.0 should do.

To get started, make sure you have `git` installed on your machine, and then run `git clone https://github.com/Aetheryx/remindme.git`. This will create a new directory with all of the files you need; move into it.

There's example database files included in the package; you can take a look at these to get a better understanding of how stuff works. You can empty these if you want to or just leave the example entries in; doesn't really matter.
Start by renaming all of the files to their proper filenames, so strip `-example` from the filenames. After that, edit your [settings.json](https://github.com/Aetheryx/remindme/blob/master/settings-example.json) file to include your bot token and all of the other information in the file.
We're almost there! After making sure node and npm are ready to go, make sure you're running a command prompt from the directory where the files are, and run:
```
npm install
```
Now the bot should be fully installed!

At this point, all you have to do should be start the bot:
```
npm start
```

Feel free to make an issue on GH or add me on Discord (Aether#2222) for any questions (:

Special thanks to CrimsonXV, Fer22f, Melmsie, Samoxive, and rgoliviera.
