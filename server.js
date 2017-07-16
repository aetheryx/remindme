const express = require('express');
const app = express();

module.exports = function () {
    app.listen(80, () => {
        console.log('Listening on port 80.');
    });

    app.use(express.static('dashboard'));

    app.get('/api/stats', (req, res) => {
        res.send(JSON.stringify({
            guilds: this.guilds.size,
            channels: `${this.channels.filter(c => c.type === 'voice').size} voice, ${this.channels.filter(c => c.type === 'text').size} text (${this.channels.size})`,
            users: `${this.guilds.map(g => parseInt(g.memberCount)).reduce((a, b) => { return a + b; })} (${this.users.size} online)`}));
    });

    app.get('/api/uptime', (req, res) => {
        res.send(process.uptime().toString());
    });
};
