const express = require('express');
const app = express();
const { promisify } = require('util');
const os = promisifyAll(require('os-utils'));
const port = os.platform() === 'win32' ? 42069 : 80; // Don't even ask.

module.exports = function (Bot) {
    app.listen(port, () => {
        Bot.log(`Web server listening on port ${port}.`);
    });

    app.use(express.static('./website'));

    app.get('/api/stats', async (req, res) => {
        const totalMem = os.totalmem();
        const processMem = process.memoryUsage().rss;
        const freeMem = os.freemem();

        res.send(JSON.stringify({
            guilds: Bot.client.guilds.size,

            channels: `${Bot.client.channels.filter(c => c.type === 'voice').size} voice, ${Bot.client.channels.filter(c => c.type === 'text').size} text (${Bot.client.channels.filter(c => c.type === 'text' || c.type === 'voice').size} total)`,

            users: `${Bot.client.users.size}`,

            ram: `${(processMem / 1048576).toFixed()}MB/` +
                 (totalMem > 1000 ? `${(totalMem / 1000).toFixed(1)}GB` : `${totalMem.toFixed()}MB`) +
                 ` (${(processMem / (totalMem * 1048576) * 100).toFixed(2)}%), ` +
                 (freeMem > 1024 ? `${(freeMem / 1024).toFixed(1)}GB` : `${freeMem.toFixed()}MB`) + ' free on server',

            cpu: `${(await os.cpuUsageAsync() * 100).toFixed(2)}%`}
        ));
    });

    app.get('/api/uptime', (req, res) => {
        res.send(process.uptime().toString());
    });
};

function osutilsWrapper (func) {
    return (callback) => {
        func((val) => {
            return callback(undefined, val);
        });
    };
};

function promisifyAll (obj) {
    const ret = obj;
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        const val = obj[key];
        if (typeof val === 'object' && !Array.isArray(val)) {
            ret[key] = promisifyAll(val);
        }
        if (typeof val !== 'function') {
            continue;
        }
        ret[`${key}Async`] = promisify(osutilsWrapper(val));
    }
    return ret;
}