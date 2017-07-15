const express = require('express');
const app = express();

module.exports = function () {
    app.listen(80, () => {
        console.log('Listening on port 80.');
    });

    app.use(express.static('dashboard'));

    app.get('/api/stats', (req, res) => {
        res.send(JSON.stringify({g:this.guilds.size,c:this.channels.filter(c => c.type === 'text').size,u:this.users.size}));
    });

    app.get('/api/uptime', (req, res) => {
        res.send(process.uptime().toString());
    });
};
