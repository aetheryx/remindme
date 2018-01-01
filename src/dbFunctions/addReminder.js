async function addReminder (options) {
  const reminders = this.dbConn.collection('reminders');
  options.createdDate = Date.now();
  reminders.insertOne(options);
}

module.exports = addReminder;