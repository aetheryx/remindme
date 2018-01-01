async function getReminders (ownerID) {
  const reminders = this.dbConn.collection('reminders');
  return reminders.find({ ownerID }).toArray();
}

module.exports = getReminders;