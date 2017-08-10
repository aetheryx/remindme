const Discord = require('discord.js');
const client = new Discord.Client();
const dashboard = require('./server.js').bind(client);

client.login('MjkwOTQ3OTcwNDU3Nzk2NjA4.DEw7Kw.WZ_6EkA2YSmTIK55KZ1L2M2Gb1A');

client.on('ready', dashboard);