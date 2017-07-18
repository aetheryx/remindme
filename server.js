const express = require('express');
const app = express();
const os = require('os');

module.exports = function () {
    app.listen(80, () => {
        console.log('Listening on port 80.');
    });

    app.use(express.static('dashboard'));

    app.get('/api/stats', async (req, res) => {
        res.send(JSON.stringify({
            guilds: this.guilds.size,
            channels: `${this.channels.filter(c => c.type === 'voice').size} voice, ${this.channels.filter(c => c.type === 'text').size} text (${this.channels.size} total)`,
            users: `${this.guilds.map(g => parseInt(g.memberCount)).reduce((a, b) => { return a + b; })} (${this.users.size} online)`,
            ram: `${(process.memoryUsage().rss / 1048576).toFixed()}MB/${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)}GB` : `${(os.totalmem() / 1048576).toFixed()}MB`)}
            (${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%), ${(os.freemem() > 1073741824 ? `${(os.freemem() / 1073741824).toFixed(1)}GB` : `${(os.freemem() / 1048576).toFixed()}MB`)} free on server`,
            cpu: `${await getCPUUsage()}% (1/5/15 minute average: ${os.loadavg().map(p => `${(p * 100).toFixed(2)}%`).join('/')})`}
        ));
    });

    app.get('/api/uptime', (req, res) => {
        res.send(process.uptime().toString());
    });
};

function getCPUUsage () {
    return new Promise(resolve => {
        const startMeasure = cpuAverage();
        setTimeout(() => {
            var endMeasure = cpuAverage();
            var idleDifference = endMeasure.idle - startMeasure.idle;
            var totalDifference = endMeasure.total - startMeasure.total;
            var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
            resolve(percentageCPU);
        }, 100);
    });
}

function cpuAverage () {
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();
    for (var i = 0, len = cpus.length; i < len; i++) {
        const cpu = cpus[i];
        for (type in cpu.times) {
            totalTick += cpu.times[type];
        }     
        totalIdle += cpu.times.idle;
    }
    return { idle: totalIdle / cpus.length,  total: totalTick / cpus.length };
}
