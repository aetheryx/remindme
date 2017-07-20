const express = require('express');
const app = express();
const os = promisifyAll(require('os-utils'));
const port = os.platform() === 'win32' ? 42069 : 80; // My router doesn't like it when I host something on port 80 :c


module.exports = function () {
    app.listen(port, () => {
        console.log(`${Date().toString().split(' ').slice(1, 5).join(' ')} Listening on port ${port}.`);
    });

    app.use(express.static('dashboard'));

    app.get('/api/stats', async (req, res) => {
        res.send(JSON.stringify({
            guilds: this.guilds.size,
            channels: `${this.channels.filter(c => c.type === 'voice').size} voice, ${this.channels.filter(c => c.type === 'text').size} text (${this.channels.filter(c => c.type === 'text' || c.type === 'voice').size} total)`,
            users: `${this.guilds.map(g => parseInt(g.memberCount)).reduce((a, b) => { return a + b; })} (${this.users.size} online)`,
            ram: `${(process.memoryUsage().rss / (1024 * 1024)).toFixed()}MB/${(os.totalmem() > 1000 ? `${(os.totalmem() / 1000).toFixed(1)}GB` : `${(os.totalmem()).toFixed()}MB`)}
            (${(process.memoryUsage().rss / (os.totalmem() * 1024 * 1024) * 100).toFixed(2)}%), ${(os.freemem() > 1024 ? `${(os.freemem() / 1024).toFixed(1)}GB` : `${(os.freemem()).toFixed()}MB`)} free on server`, // very big mess. Fix later. os-util uses SI, process.memoryUsage() uses binary.
            cpu: `${(await os.cpuUsageAsync() * 100).toFixed(2)}%`}
        ));
    });

    app.get('/api/uptime', (req, res) => {
        res.send(process.uptime().toString());
    });
};

function promisifyAll (obj) {
    const { promisify } = require('util');
    const ret = obj;
    for (const key in obj) {
        if (!obj.hasOwnProperty(key))
            continue;
        const val = obj[key];
        if (typeof val === 'object' && !Array.isArray(val))
            ret[key] = promisifyAll(val);
        if(typeof val !== 'function')
            continue;
        const osutilsWrapper = (func) => {
            return (callback) => {
                func((val) => {
                    return callback(undefined, val);
                });
            };
        };
        ret[`${key}Async`] = promisify(osutilsWrapper(val));
    }
    return ret;
}