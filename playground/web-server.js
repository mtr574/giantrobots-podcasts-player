const http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'content-type': 'text/plain'
    });
    res.write('hello from nodejs!\n');
    res.end('good-bye!');
});

server.listen(8080);