async function onReady () {
  this.log(`Logged in as ${this.client.user.username}#${this.client.user.discriminator}.`);
}

module.exports = onReady;