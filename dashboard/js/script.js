var uptime = 0;
updateStats();
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
        document.getElementById('uptime').innerHTML = humanizeDuration(uptime.toFixed() * 1000, { conjunction: ' and ', serialComma: false }); // eslint-disable-line no-undef
        uptime++;
    }, 1000);
}

function updateStats () {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const stats = JSON.parse(xhttp.responseText);
            const array = Object.keys(stats);
            for (const value in array) {
                document.getElementById(array[value]).innerHTML = stats[array[value]];
            }
            setTimeout(updateStats, 2000);
        }
    };
    xhttp.open('GET', '/api/stats', true);
    xhttp.send();
}

    function doBarrelRoll(){document.body.style.msTransform="rotate(360deg)",document.body.style.msTransitionDuration="4s",document.body.style.msTransitionProperty="all",document.body.style.MozTransform="rotate(360deg)",document.body.style.MozTransitionDuration="4s",document.body.style.MozTransitionProperty="all",document.body.style.WebkitTransform="rotate(360deg)",document.body.style.WebkitTransitionDuration="4s",document.body.style.WebkitTransitionProperty="all",document.body.style.OTransform="rotate(360deg)",document.body.style.OTransitionDuration="4s",document.body.style.OTransitionProperty="all",setTimeout("document.body.removeAttribute('style'); roll_on = 0;",4e3)}function startRoll(){roll_on||(roll_on=1,doBarrelRoll())}var Konami=function(t){var e={addEvent:function(t,e,n,o){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&(t["e"+e+n]=n,t[e+n]=function(){t["e"+e+n](window.event,o)},t.attachEvent("on"+e,t[e+n]))},input:"",pattern:"38384040373937396665",load:function(t){this.addEvent(document,"keydown",function(n,o){if(o&&(e=o),e.input+=n?n.keyCode:event.keyCode,e.input.length>e.pattern.length&&(e.input=e.input.substr(e.input.length-e.pattern.length)),e.input==e.pattern)return e.code(t),e.input="",n.preventDefault(),!1},this),this.iphone.load(t)},code:function(t){window.location=t},iphone:{start_x:0,start_y:0,stop_x:0,stop_y:0,tap:!1,capture:!1,orig_keys:"",keys:["UP","UP","DOWN","DOWN","LEFT","RIGHT","LEFT","RIGHT","TAP","TAP"],input:[],code:function(t){e.code(t)},load:function(t){this.orig_keys=this.keys,e.addEvent(document,"touchmove",function(t){if(1==t.touches.length&&1==e.iphone.capture){var n=t.touches[0];e.iphone.stop_x=n.pageX,e.iphone.stop_y=n.pageY,e.iphone.tap=!1,e.iphone.capture=!1}}),e.addEvent(document,"touchend",function(n){if(e.iphone.input.push(e.iphone.check_direction()),e.iphone.input.length>e.iphone.keys.length&&e.iphone.input.shift(),e.iphone.input.length===e.iphone.keys.length){for(var o=!0,i=0;i<e.iphone.keys.length;i++)e.iphone.input[i]!==e.iphone.keys[i]&&(o=!1);o&&e.iphone.code(t)}},!1),e.addEvent(document,"touchstart",function(t){e.iphone.start_x=t.changedTouches[0].pageX,e.iphone.start_y=t.changedTouches[0].pageY,e.iphone.tap=!0,e.iphone.capture=!0})},check_direction:function(){return x_magnitude=Math.abs(this.start_x-this.stop_x),y_magnitude=Math.abs(this.start_y-this.stop_y),x=this.start_x-this.stop_x<0?"RIGHT":"LEFT",y=this.start_y-this.stop_y<0?"DOWN":"UP",result=x_magnitude>y_magnitude?x:y,result=1==this.tap?"TAP":result,result}}};return"string"==typeof t&&e.load(t),"function"==typeof t&&(e.code=t,e.load()),e},roll_on=0,x=Konami(startRoll);