async function deleteReminder (_id) {
  const reminders = this.dbConn.collection('reminders');
  return reminders.deleteMany({ _id });
}

module.exports = deleteReminder;
