async function addReminder (options) {
  const reminders = this.dbConn.collection('reminders');

  const encrypted = this.utils.encrypt(options.reminder);
  options.reminder = encrypted.encryptedString;
  options.key = encrypted.key;

  options.createdDate = Date.now();
  reminders.insertOne(options);
}

module.exports = addReminder;