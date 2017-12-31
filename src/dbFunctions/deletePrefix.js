async function deletePrefix (id) {
  const prefixes = this.dbConn.collection('prefixes');
  return prefixes.remove({ id });
}

module.exports = deletePrefix;