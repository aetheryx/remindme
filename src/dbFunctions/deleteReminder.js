async function deleteReminder (_id) {
  const reminders = this.dbConn.collection('reminders');
  return reminders.remove({ _id });
}

module.exports = deleteReminder;