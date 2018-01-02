async function getExpiredReminders () {
  const reminders = this.dbConn.collection('reminders');
  return reminders.find({
    dueDate: {
      $lt: Date.now()
    }
  }).toArray();
}

module.exports = getExpiredReminders;