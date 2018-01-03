async function getExpiredReminders () {
  const reminders = this.dbConn.collection('reminders');
  return (await reminders.find({
    dueDate: {
      $lt: Date.now()
    }
  }).toArray())
    .map(r => {
      const decrypted = this.utils.decrypt(r.reminder, r.key);
      r.reminder = decrypted;
      return r;
    });
}

module.exports = getExpiredReminders;