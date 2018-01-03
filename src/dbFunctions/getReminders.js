async function getReminders (ownerID) {
  const reminders = this.dbConn.collection('reminders');
  return (await reminders.find({ ownerID })
    .toArray())
    .map(r => {
      const decrypted = this.utils.decrypt(r.reminder, r.key);
      r.reminder = decrypted;
      return r;
    });
}

module.exports = getReminders;