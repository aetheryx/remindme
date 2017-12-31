const methods = [86400, 3600, 60, 1];

function parseDuration (time) {
  const timeStr = [Math.floor(time / methods[0]).toString().padStart(2, '0')];
  for (let i = 0; i < 3; i++) {
    timeStr.push(Math.floor(time % methods[i] / methods[i + 1]).toString().padStart(2, '0'));
  }
  return timeStr.join(':');
}

module.exports = parseDuration;