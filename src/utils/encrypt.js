const KEY_LENGTH_SIZE = 24;

const getRandomString = () => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return new Array(KEY_LENGTH_SIZE)
    .fill(1)
    .reduce(previousValue => previousValue + possible.charAt(Math.floor(Math.random() * possible.length)), '');
};

function encrypt (stringToBeEncrypted) {
  const key = getRandomString();
  const cipher = crypto.createCipher('aes256', key);
  let encryptedString = cipher.update(stringToBeEncrypted, '5utf8', 'hex');

  encryptedString += cipher.final('hex');

  return {
    encryptedString,
    key
  };
}

module.exports = encrypt;