function decrypt (stringToBeDecrypted, key) {
  const decipher = crypto.createDecipher('aes256', key);
  let decryptedString = decipher.update(stringToBeDecrypted, 'hex', 'utf8');
  const finalDecryptedString = decryptedString += decipher.final('utf8');

  return finalDecryptedString;
}

module.exports = decrypt;