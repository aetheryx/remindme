setInterval(() => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const array = ['guilds', 'channels', 'users'];
            for (const value in array)
                document.getElementById(array[value]).innerHTML = JSON.parse(xhttp.responseText)[array[value]];
        }
    };
    xhttp.open('GET', '/api/stats', true);
    xhttp.send();
}, 10000);