const net = require('net');

var sockets = [];

var server = net.Server(function(socket) {

    sockets.push(socket);

    socket.on('data', function(data) {
        for (var i = 0; i < sockets.length; i++) {
            sockets[i].write(data);
        }
    });

    socket.on('end', function() {
        var i = sockets.indexOf(socket);
        sockets.splice(i, 1);
        socket.write(i + ' is gone away...');
    });

});

server.listen(8080);