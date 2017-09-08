var mongojs = require("mongojs");
var db = mongojs('localhost:27017/jsGame', ['account','progress']);
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server Started, listening on localhost:2000");
// The above code is all the code we will need to use Express for the whole game.
// This is the client asking the server for files on port:2000.

var DEBUG = true;

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
	self.getDistance = function(pt) {  // THis is necessary for collision
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	// to use, create a loop like: 
	// for(var i in Player.list) {
	// 		var p = Player.list[i];
	// 		if (self.getDistance(p) < 32) {
	//			handle collision, ex: hp--;
	// 		}	
	// }
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
	initPack.player.push({
		id:self.id,
		x:self.x,
		y:self.y,
		number:self.number
	});
	return self;
}

Player.list = {};


Player.onConnect = function(socket){// This creates player and add listener for movement.
	var player = Player(socket.id);	// Calls the object constructor of the player, passing the Math.random
	// number that was assigned to it on initial connection and then assigned the socket number.
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
	removePack.player.push(socket.id);
}

Player.update = function(){
	var pack = [];
	for (var i in Player.list) {
		var player = Player.list[i];
		player.updatePosition(); // This loop animates the moving of the character.
			pack.push({
				id:player.id,			
				x:player.x,
				y:player.y,
		});
	}
	return pack;	
}

// NPC creation and info

var NPC = function(id){
	var self = Entity();
	self.id = id; //You have to pass the id in this function
	self.number = "" + Math.floor(10 * Math.random());
	NPC.list[id] = self;
	initPack.npc.push({
		id:id,
		x:self.x,
		y:self.y
	});
	return self;
};

NPC.list = {};

NPC.update = function(){
	var pack = [];
	for (var i in NPC.list) {
		var npc = NPC.list[i];
		npc.updatePosition();
			if (npc.toRemove) {
				delete NPC.list[i];
				removePack.npc.push(npc.id);
			} else {
				pack.push({
					id:npc.id,
					x:npc.x,
					y:npc.y
				});
			}
	}
	return pack;
}

var USERS = {
// username:password for each player
	"bob": "wow",
	"rob": "hey",
	"kim": "yay"
}

var isValidPassword = function(data, cb){ // cb is callback
	db.account.find({username:data.username,password:data.password}, function(err, res){
		//connecting to mongoDB server
		if (res.length > 0) { // The find function returns an array
			cb(true);
		} else {
			cb(false);
		}
	});
// callbacks are used to return data that is delayed from server.
}

var isUsernameTaken = function(data, cb){
	db.account.find({username:data.username}, function(err, res){
		//connected to mongodb server
		if (res.length > 0) { // The find function returns an array
			cb(true);
		} else {
			cb(false);
		}
	});

}

var addUser = function(data, cb){
	//connecting to mongodb server
	db.account.insert({username:data.username,password:data.password}, function(err){
		cb();
	});

}


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.on("signIn", function(data) { // second parameter function is callback.  Needed for server to work.
		console.log(data.username, data.password);
		isValidPassword(data, function(res){
			if(res){
				Player.onConnect(socket); // Activates player character
				socket.emit('signInResponse', {success:true});
				console.log("signInResponse", true);
			} else {
				socket.emit('signInResponse', {success:false});
				console.log("signInResponse", false);
			}
		});
	});

	socket.on("signUp", function(data) {
		console.log(data.username, data.password);
		isUsernameTaken(data, function(res){
			if(res){
				socket.emit('signUpResponse', {success:false});
				console.log(false);
			} else {
				addUser(data, function(){
					socket.emit('signUpResponse', {success:true});
					console.log(true);
				});
			}
		});
	});

	
	socket.on("disconnect", function() {
		delete SOCKET_LIST[socket.id];
		//This disconnects the player when they close their browser.
		Player.onDisconnect(socket);
	});
	
	socket.on("sendMsgToServer", function(msg) {
		console.log(msg);
		var playerName = ("" + socket.id).slice(2,5);
		for(var i in SOCKET_LIST) {
			SOCKET_LIST[i].emit('addToChat', playerName +":  " + msg);
		}
	});

	socket.on("evalServer", function(data) {
		if (!DEBUG){
			return;
		}
		console.log(data);
		var res = eval(data);
		socket.emit('evalAnswer', res);		
	});

});

var initPack = {player:[],npc:[]};
var removePack = {player:[],npc:[]};


// THis iterates through player list updating position and allowing
// you to see other players in your screen.
setInterval(function(){
	var pack = {
	player: Player.update(), // This interates through for players and other entities.
	npc: NPC.update()// Add Npc list to animate characters.
	}

	for (var i in SOCKET_LIST){ //This is a loop to emit positions to client
		var socket = SOCKET_LIST[i];
		socket.emit('init', initPack); 
		socket.emit('update', pack); 
		socket.emit('remove', removePack); 
	}
	initPack.player = [];  // This deletes the data from the pack so it is sending an
	initPack.npc = [];     // empty array so you are not sending too much data.
	removePack.player = [];// These are only needing to send data once.
	removePack.npc = [];

},1000/25);




