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
// Here we are creating a new object called the PLAYER_LIST.
var PLAYER_LIST = {};
// Now we are adding a player constrictor with the function below.
var Player = function(id) { //This will create a player with this id
	var self = {
		x: 325,
		y: 200,
		id: id,  //You have to pass the id in this function
		number: " " + Math.floor(10 * Math.random()),
		east: false,
		west: false,
		north: false,
		south: false,
		maxSpd: 10, 
	}
	self.updatePosition = function() {
		if(self.east)
			self.x += self.maxSpd;
		if(self.west)
			self.x -= self.maxSpd;
		if(self.north)
			self.y -= self.maxSpd;
		if(self.south)
			self.y += self.maxSpd;
	}
	return self;
}
var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	socket.on("disconnect", function() {
		delete SOCKET_LIST[socket.id];
		//This disconnects the player when they close their browser.
		delete PLAYER_LIST[socket.id];
	});
	
	// socket.emit('serverMsg', {
	// 	msg: 'hello'
	// });

	socket.on('newPositions', function(data) {
		console.log(data);
		if (data.direction === 'east') {
			player.x += (data.endPosition * player.maxSpd);
		}
		else if (data.direction === "west") {
			player.x -= (data.endPosition * player.maxSpd);
		}
		else if (data.direction === "north") {
			player.y -= (data.endPosition * player.maxSpd);
		}
		else if (data.direction === "south") {
			player.y += (data.endPosition * player.maxSpd);
		}
	});

	


});
// To allow the player to interact with the character
// you need to seperate the sockets and players in the 
// SOCKET_LIST.  You cannot have the x and y position
// directly linked with the socket if you want to control
// your character.  So we create a PLAYER_LIST object.



setInterval(function(){
	var pack = [];
	for (var i in PLAYER_LIST) {
		var player = PLAYER_LIST[i];
		player.updatePosition(); // This is how to move the character.
		//  I may need to add 4 functions that will be called through 
		//  the fabricated console on the page.

			pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}


	for (var i in SOCKET_LIST){ //This is a loop to emit positions to client
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack) 
		
	}

},1000/25);




