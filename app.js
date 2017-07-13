var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server Started");
// The above code is all the code we will need to use Express for the whole game.
// This is the client asking the server for files on port:2000.

// You can use localhost:2000 in web browser after you start the server by typing 
//	node app.js in the bash shell, and it will display what you have in index.html
//  in the client folder.

// We will use the syntax of passing a function as an argument into another function
// while coding communication on the server.

var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket) {
	console.log('socket connection');
});





