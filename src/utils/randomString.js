function randomString(stringLength) {
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

module.exports = randomString;