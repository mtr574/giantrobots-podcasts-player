const net = require('net');

var socket = net.createServer(function(socket) {
    socket.write('im a socket, listening...');
    
    socket.on('data', function(data) {
      socket.write(data);
    });
});

socket.listen(8080);