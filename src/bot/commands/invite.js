async function inviteCommand (msg, args) {
  const id = msg.author.id === this.config.ownerID && (msg.mentions[0] && msg.mentions[0].id || args[0]) || this.client.user.id;

  return {
    description: `Click [here](https://discordapp.com/oauth2/authorize?permissions=27648&scope=bot&client_id=${id}) to invite me to your server,` +
    'or click [here](https://discord.gg/Yphr6WG) for an invite to RemindMeBot\'s support server.'
  };
}

module.exports = {
  command: inviteCommand,
  name: 'invite',
  description: 'Returns an invite for RemindMeBot and the support server.'
};