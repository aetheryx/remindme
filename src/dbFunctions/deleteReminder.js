async function deleteReminder (_id) {
  const reminders = this.dbConn.collection('reminders');
  return reminders.deleteOne({ _id });
}

module.exports = deleteReminder;
