/* eslint-disable */
const KEY_LENGTH_SIZE = 24;
const crypto = require('crypto');

module.exports = (Bot) => ({
    encrypt: async function encrypt (stringToBeEncrypted) {
        const key = randomString(KEY_LENGTH_SIZE);
        const cipher = crypto.createCipher('aes256', key);
        let encryptedString = cipher.update(stringToBeEncrypted, 'utf8', 'hex');

        encryptedString += cipher.final('hex');

        // Here we are returning the encrypted string and also the key
        return {
            encryptedString,
            key
        };
    },

    decrypt: async function decrypt (stringToBeDecrypted, key) {
        const decipher = crypto.createDecipher('aes256', key);
        let decryptedString = decipher.update(stringToBeDecrypted, 'hex', 'utf8');
        const finalDecryptedString = decryptedString += decipher.final('utf8');

        return finalDecryptedString;
    }
})

function randomString (stringLength) {
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return new Array(stringLength)
        .fill(1)
        .reduce(
        previousValue =>
            previousValue +
            possible.charAt(Math.floor(Math.random() * possible.length)),
        ''
        );
}