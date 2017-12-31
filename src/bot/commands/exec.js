const { exec } = require('child_process');

async function execCommand (Bot, msg, args) {
  exec(args.join(' '), async (e, stdout, stderr) => {
    if (stdout.length + stderr.length > 2000) {
      const res = await Bot.utils.post({
        url: ['hastebin.com', '/documents'],
        headers: {
          'Content-Type': 'application/json'
        }
      }, `${stdout}\n\n${stderr}`);

      Bot.sendMessage(msg.channel.id, { embed: {
        color: Bot.config.embedColor,
        description: `Console log exceeds 2000 characters. View [here](https://hastebin.com/${JSON.parse(res).key}).`
      }});
    } else {
      if (!stderr && !stdout) {
        return msg.react('\u2611');
      }
      Bot.sendMessage(msg.channel.id, `${stdout ? `Info: \`\`\`\n${stdout}\n\`\`\`` : ''}\n${stderr ? `Errors: \`\`\`\n${stderr}\`\`\`` : ''}`);
    }
  });
}

module.exports = {
  call: execCommand,
  name: 'exec',
  usage: '{command} <command>',
  aliases: ['zsh'], // edge as fuck :^)
  ownerOnly: true,
  description: 'Bot owner only.'
};