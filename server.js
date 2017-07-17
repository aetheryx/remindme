const express = require('express');
const app = express();
const os = require('os');

module.exports = function () {
    app.listen(80, () => {
        console.log('Listening on port 80.');
    });

    app.use(express.static('dashboard'));

    app.get('/api/stats', (req, res) => {
        res.send(JSON.stringify({
            guilds: this.guilds.size,
            channels: `${this.channels.filter(c => c.type === 'voice').size} voice, ${this.channels.filter(c => c.type === 'text').size} text (${this.channels.size} total)`,
            users: `${this.guilds.map(g => parseInt(g.memberCount)).reduce((a, b) => { return a + b; })} (${this.users.size} online)`,
            ram: `${(process.memoryUsage().rss / 1048576).toFixed()}MB/${(os.totalmem() > 1073741824 ? `${(os.totalmem() / 1073741824).toFixed(1)}GB` : `${(os.totalmem() / 1048576).toFixed()}MB`)}
            (${(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2)}%), ${(os.freemem() > 1073741824 ? `${(os.freemem() / 1073741824).toFixed(1)}GB` : `${(os.freemem() / 1048576).toFixed()}MB`)} free on server`}
        ));
    });

    app.get('/api/uptime', (req, res) => {
        res.send(process.uptime().toString());
    });
};
