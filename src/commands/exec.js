const { exec } = require('child_process');
const snekfetch = require('snekfetch');

exports.run = async function (Bot, msg, args) {
    exec(args.join(' '), async (e, stdout, stderr) => {
        if (stdout.length + stderr.length > 2000) {
            const res = await snekfetch.post('https://hastebin.com/documents')
                .send(`${stdout}\n\n${stderr}`);

            Bot.sendMessage(msg.channel.id, { embed: {
                color: Bot.config.embedColor,
                description: `Console log exceeds 2000 characters. View [here](https://hastebin.com/${res.body.key}).`
            }});
        } else {
            if (!stderr && !stdout) {
                return msg.react('\u2611');
            }
            Bot.sendMessage(msg.channel.id, `${stdout ? `Info: \`\`\`\n${stdout}\n\`\`\`` : ''}\n${stderr ? `Errors: \`\`\`\n${stderr}\`\`\`` : ''}`);
        }
    });
};

exports.props = {
    name        : 'exec',
    usage       : '{command} <command>',
    aliases     : ['bash'],
    ownerOnly   : true,
    description : 'Bot owner only.'
};
