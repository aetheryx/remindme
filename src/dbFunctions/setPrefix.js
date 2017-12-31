async function updatePrefix (id, prefix) {
  const prefixes = this.dbConn.collection('prefixes');

  const existingPrefix = await prefixes.findOne({ id });

  if (existingPrefix) {
    return prefixes.updateOne({ _id: existingPrefix._id }, { '$set': { prefix } });
  } else {
    return prefixes.insertOne({ id, prefix });
  }
}

module.exports = updatePrefix;