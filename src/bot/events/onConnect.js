async function onConnect (shardID) {
  this.log(`Shard ${shardID} successfully initialized.`);
}

module.exports = onConnect;