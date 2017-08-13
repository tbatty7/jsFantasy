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



var SOCKET_LIST = {};

var PLAYER_LIST = {}; // This contains all the players.

var Entity = function(id){
	var self = {
		x: 340,
		y: 200,
		id: id,
		stepSize: 20,
		
	}
	self.update = function() {
		self.updatePosition();
	}
	self.updatePosition = function() {
		self.x += self.stepSize;
		self.y += self.stepSize;
	}
	return self;
}


var Player = function(id) { //This will create a player with this id
	var self = Entity();
	self.id = id; //You have to pass the id in this function
	self.number = "" + Math.floor(10 * Math.random());
	self.east = 340;
	self.west = 340;
	self.north = 200;
	self.south = 200;
	self.maxSpd = 5;
	self.updatePosition = function() {
	// This method animates the movement by incrementing the x or
	// y values until they match the increase to the new position 
	// parameter set in the direction functions.  I also had 
	// to change the opposite direction east for west and west 
	// for east, so it would not cause conflicting commands.
		if(self.east > self.x) {
			self.x += self.maxSpd;
			self.west += self.maxSpd;
			console.log("X: " + self.x + " Y: " + self.y);
		} else if(self.west < self.x) {
			self.x -= self.maxSpd;
			self.east -= self.maxSpd;
			console.log("X: " + self.x + " Y: " + self.y);
		} else if(self.north < self.y) {
			self.y -= self.maxSpd;
			self.south -= self.maxSpd;
			console.log("X: " + self.x + " Y: " + self.y);
		} else if(self.south > self.y) {
			self.y += self.maxSpd;
			self.north += self.maxSpd;
			console.log("X: " + self.x + " Y: " + self.y);
		}
	}
	Player.list[id] = self;
	return self;
}

Player.list = {};

Player.onConnect = function(socket){
	var player = Player(socket.id);	
	socket.on('newPositions', function(data) {
		console.log(data);
// This changes the value of n,s,e,w in player object to the
// endPosition value assigned in the parameter of the direction
// functions you type in the console.
		if (data.direction === 'east') {
			player.east += (data.endPosition * player.stepSize);
		}
		else if (data.direction === "west") {
			player.west -= (data.endPosition * player.stepSize);
		}
		else if (data.direction === "north") {
			player.north -= (data.endPosition * player.stepSize);
		}
		else if (data.direction === "south") {
			player.south += (data.endPosition * player.stepSize);
		}
	});
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}

Player.update = function(){
	var pack = [];
	for (var i in Player.list) {
		var player = Player.list[i];
		player.updatePosition(); // This loop animates the moving of the character.
			pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}
	return pack;	
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	Player.onConnect(socket);
	socket.on("disconnect", function() {
		delete SOCKET_LIST[socket.id];
		//This disconnects the player when they close their browser.
		Player.onDisconnect(socket);
	});
	
	socket.on("sendMsgToServer", function(msg) {
		console.log(msg);
		var playerName = ("" + socket.id).slice(2,5);
		for(var i in SOCKET_LIST) {
			SOCKET_LIST[i].emit('addToChat', playerName + msg);
		}
	});

});

// THis iterates through player list updating position and allowing
// you to see other players in your screen.
setInterval(function(){
	var pack = Player.update();
	
	

	for (var i in SOCKET_LIST){ //This is a loop to emit positions to client
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack) 
		
	}

},1000/25);




