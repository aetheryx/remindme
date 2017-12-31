async function getPrefix (id) {
  const prefixes = this.dbConn.collection('prefixes');
  const prefix = await prefixes.findOne({ id });
  return prefix && prefix.prefix || this.config.defaultPrefix;
}

module.exports = getPrefix;