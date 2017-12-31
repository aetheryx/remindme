const { inspect } = require('util');

async function evalCommand (Bot, msg, args) {
  let input = args.join(' ');
  const silent = input.includes('--silent');
  const asynchr = input.includes('return');
  if (silent) {
    input = input.replace('--silent', '');
  }

  let result;
  try {
    result = await (asynchr ? eval(`(async()=>{${input}})();`) : eval(input));
    if (typeof result !== 'string') {
      result = inspect(result, { depth: 1 }).length > 1990 ?
        inspect(result, { depth: 0 }) :
        inspect(result, { depth: 1 });
    }
    result = result.replace(new RegExp(Bot.config.keys.token, 'gi'), 'i think the fuck not you trick ass bitch');
  } catch (err) {
    result = err.message;
  }

  if (!silent) {
    Bot.sendMessage(msg.channel.id, `${input}\n\`\`\`js\n${result}\n\`\`\``);
  }
}

module.exports = {
  call: evalCommand,
  name: 'eval',
  usage: '{command} <script>',
  aliases: ['ev'],
  ownerOnly: true,
  description: 'Bot owner only.'
};