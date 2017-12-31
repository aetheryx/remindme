const https = require('https');

function post (options, body) {
  return new Promise((resolve, reject) => { // TODO: catch this through https
    const data = JSON.stringify(body);
    const postOptions = {
      host: options.url[0],
      path: options.url[1],
      method: 'POST',
      headers: options.headers || {}
    };

    let output = '';

    const req = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        output += chunk;
      });
      res.on('end', () => {
        resolve(output);
      });
    });
    req.write(data);
    req.end();
  });
}

module.exports = post;