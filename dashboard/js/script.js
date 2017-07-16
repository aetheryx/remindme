let uptime = 0;
updateStats();
setInterval(updateStats, 2000);
initiateUptimeClock();

function initiateUptimeClock () {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200)
            uptime = +xhttp.responseText;
    };
    xhttp.open('GET', '/api/uptime', true);
    xhttp.send();

    setInterval(() => {
        document.getElementById('uptime').innerHTML = '9 days, 99 hours, 99 minutes and 99 seconds'
        // humanizeDuration(uptime.toFixed() * 1000, { conjunction: ' and ', serialComma: false }); // eslint-disable-line no-undef
        uptime++;
    }, 1000);
}

function updateStats () {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const stats = JSON.parse(xhttp.responseText);
            const array = Object.keys(stats);
            for (const value in array)
                document.getElementById(array[value]).innerHTML = stats[array[value]];
        }
    };
    xhttp.open('GET', '/api/stats', true);
    xhttp.send();
}

