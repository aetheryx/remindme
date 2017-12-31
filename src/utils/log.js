/* eslint-disable no-console*/
const colors = {
  'error' : '\u001b[31m',
  'info'  : '\u001b[32m',
  'warn'  : '\u001b[33m',
  'reset' : '\u001b[39m'
};

function log (message, type = 'info') {
  const datePrefix = Date().toString().split(' ').slice(1, 5).join(' ');
  console.log(`${colors[type]}[${datePrefix}, ${type.toUpperCase()}]${colors['reset']} ${message}`);
}

module.exports = log;