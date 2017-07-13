updateValues();
setInterval(updateValues, 2000);

function updateValues () {
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