const RemindMeBot = require(`${__dirname}/src/bot`);
const config = require(`${__dirname}/config.json`);

const bot = new RemindMeBot(config);

process.on('SIGINT', async () => {
  bot.log('Gracefully exiting..');

  try {
    await bot.client.disconnect({ reconnect: false });
    await bot.dbClient.close();
  } catch (_) {} // eslint-disable-line no-empty

  process.exit();
});

setTimeout(() => process.emit('SIGINT'), 1000 * 60 * 60 * 8); // 8 hours
