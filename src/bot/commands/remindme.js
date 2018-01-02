const argless = require(`${__dirname}/remindmeArgless.js`);
const withArgs = require(`${__dirname}/remindmeWithArgs.js`);

async function remindmeCommand (msg, args) {
  if (args[0] && args[0].toLowerCase() === 'me') {
    args.shift();
  }

  if (args[0]) {
    return withArgs.call(this, msg, args);
  } else {
    return argless.call(this, msg);
  }
}

module.exports = {
  command: remindmeCommand,
  name: 'remindme',
  usage: '{command} <time_argument> <"message"> [channel: #channel|here] [-recurring <time_argument>]',
  aliases: ['remind'],
  description: 'Creates a reminder. Pass without args to start a guided tour.'
};