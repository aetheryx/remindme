async function onCreate (guild) {
  const message = `Thanks for adding me to your server! To see a list of my commands, send \`${this.config.defaultPrefix}help\`.\nFeel free to DM Aetheryx#2222 for any questions or concerns!`;
  this.sendMessage(guild.ownerID, message, true);
  postStats.call(this);
}

async function onDelete (guild) {
  await this.db.deletePrefix(guild.id);
  postStats.call(this);
}

async function postStats () {
  if (!this.devMode) {
    for (const botlist of this.config.botlists) {
      this.utils.post({
        url: botlist.url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': botlist.token
        }
      }, { server_count: this.client.guilds.size });
    }
  }
}

module.exports = { onCreate, onDelete };