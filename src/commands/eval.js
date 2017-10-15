const { inspect } = require('util');

exports.run = async function (Bot, msg, args) {
    let input = args.join(' ');
    const silent = input.includes('--silent');
    const asynchr = input.includes('return');
    if (silent) {
        input = input.replace('--silent', '');
    }

    let result;
    try {
        result = asynchr ? await eval(`(async()=>{${input}})();`) : eval(input);
        if (typeof result !== 'string') {
            result = inspect(result, { depth: 0 });
        }
        result = result.replace(Bot.tokenRegex, 'i think the fuck not you trick ass bitch');
    } catch (err) {
        result = err.message;
    }

    if (!silent) {
        Bot.sendMessage(msg.channel.id, `${input}\n\`\`\`js\n${result}\n\`\`\``);
    }
};

exports.props = {
    name        : 'eval',
    usage       : '{command}',
    aliases     : ['ev'],
    ownerOnly   : true,
    description : 'TODO',
};
