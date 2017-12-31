const timeParser = require('time-parser');

const shorthandRX = /^ *([0-9]+) *(s|m|h|d|w) *$/i;
const shorthandTimes = {
  's': 1000,
  'm': 60000,
  'h': 3600000,
  'd': 86400000,
  'w': 604800000
};

const timeRXes = {
  'next': 'one',
  'a ': 'one ',
  'an ': 'one ',
  'sec ': 'second ',
  'min ': 'minute ',
  'mins ': 'minutes '
};

function parseTime (input) {
  const shorthand = input.match(shorthandRX);
  if (shorthand) {
    const relative = Number(shorthand[1]) * shorthandTimes[shorthand[2]];
    return {
      absolute: Date.now() + relative,
      relative
    };
  }

  Object.keys(timeRXes).map(regexKey => {
    if (input.includes(regexKey)) {
      input = input.replace(new RegExp(regexKey, 'gi'), timeRXes[regexKey]);
    }
  });

  const parsedTime = timeParser(input.trim());

  if (!parsedTime.absolute) {
    return 'INVALID';
  }

  if (parsedTime.relative < 0) {
    const currentYear = new Date().getFullYear();
    if (input.includes(currentYear)) {
      return 'SET_FOR_PAST';
    } else {
      return parseTime(`${input} ${currentYear + 1}`);
    }
  }

  return parsedTime;
}

module.exports = parseTime;