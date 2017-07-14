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

var SOCKET_LIST = {};

var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	socket.x = 0;
	socket.y = 0;
	socket.number = ' ' + Math.floor(10 * Math.random());
	SOCKET_LIST[socket.id] = socket;

	socket.on("disconnect", function() {
		delete SOCKET_LIST[socket.id];
		//This disconnects the player when they close their browser.
	});
	socket.emit('serverMsg', {
		msg: 'hello'
	});

});

setInterval(function(){
	var pack = [];
	for (var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.x++;
		socket.y++;
		pack.push({
			x:socket.x,
			y:socket.y,
			number:socket.number
		});
	}
	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack) 
		
	}

},1000/25);




