/* eslint-disable no-console */
const chalk = require('chalk');
module.exports = function (str, type) {
    if (type === 'warn') {
        console.warn(chalk.yellow(`[${Date().toString().split(' ').slice(1, 5).join(' ')}, WARN] `) + str);
    } else if (type === 'error') {
        console.error(chalk.red(`[${Date().toString().split(' ').slice(1, 5).join(' ')}, ERROR] `) + str);
    } else {
        console.log(chalk.green(`[${Date().toString().split(' ').slice(1, 5).join(' ')}, INFO] `) + str);
    }
};