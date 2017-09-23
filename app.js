var mongojs = require("mongojs");
// var db = mongojs('localhost:27017/jsGame', ['account','progress']);
var db = mongojs(process.env.MONGODB_URI || 'localhost:27017/jsGame', ['account','progress']);
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var fs = require('fs');  // This is File System, to create files. Comes natively with Node.
// To use, type fs.writeFile('./client/directory and file name', content to add); -- Use for creating journal

var port = process.env.PORT || 2000;

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(port);
console.log("Server Started, listening on localhost:2000");
// The above code is all the code we will need to use Express for the whole game.
// This is the client asking the server for files on port:2000.

var DEBUG = false;
var screenWidth = 700;
var screenHeight = 400;
var tileSize = 32;

var SOCKET_LIST = {};

var PLAYER_LIST = {}; // This contains all the players.


//////////////////////////////////////////////////// MAPS ///////////////////////////////////////////////

Maps = function(id,width,height,grid){
    var self = {
        id:id,
        width: grid[0].length * tileSize,
        height: grid.length * tileSize,
        grid: grid,  // This is a 2 dimension array for a tile map to create parts of map that you cannot walk over.
    }

    self.isPositionWall = function(pt){  // this interprets your position to say where you are on the map.
    	var gridX = Math.floor(pt.x/tileSize);
    	var gridY = Math.floor(pt.y/tileSize);
    	if (gridX < 0 || gridX >= self.grid[0].length){ // This tests if you are outside the map E/W.
    		return true;
    	}
    	if (gridY < 0 || gridY >= self.grid.length){  // This tests if you are outside of map N/S
    		return true;
    	}
    	return self.grid[gridY][gridX];  // the y is first because it corresponds to the rows and X is 
	}							    	// the number of items in each array, aka the columns.
    

    return self;
}


MapList = {}; //Where the maps will live

function createGrid(width, height, array1){  // this takes a single long array from Tiled map and splits it into a grid.
	var grid = [];
	for (var i = 0; i < height; i++){  // the height in number of tiles goes first
		grid[i] = [];
		for(var j = 0; j < width; j++){  // the width in tiles goes here
			grid[i][j] = array1[i * width + j];
		}
	}
	return grid;
}

//////////// house1Map
var house1TileSize = {width:34,height:25};  // Just informational - the number of tiles wide and high map is
// the below array was pulled out of the Tiled program saving the file as javascript.
var house1array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 290, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 290, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 290, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
MapList["house1Floor"] = Maps('house1Floor',1088,800,createGrid(34,25,house1array));

//////////// villageMap
var villageTileSize = {width:44,height:30};  // Just made up dimensions
MapList['villageFloor'] = Maps('villageFloor',1088,800,createGrid(34,25,house1array));
////////////////////////////////////////////  PLAYER  ////////////////////////////////////////////////////

var Entity = function(param){
	var self = {
		x: 340,
		y: 200,
		id: "",
		stepSize: 20,
		xpGained: 0,
		gainXp: 0,
		mapFloor: 'villageFloor',
		mapCeiling: 'villageCeiling',
		height: 50,
		width: 40,
	}
	if (param) {
		if (param.x)
			self.x = param.x;
		if (param.y)
			self.y = param.y;
		if (param.mapFloor)
			self.mapFloor = param.mapFloor;
		if (param.mapCeiling)
			self.mapCeiling = param.mapCeiling;
		if (param.width)
			self.width = param.width;
		if (param.height)
			self.height = param.height;
		if (param.id)
			self.id = param.id; //You have to pass the id as an object for everything to work.
	}
	self.update = function() {
		self.updatePosition();
		if (self.hp <= 0){  // What to do if player dies.
			self.x = 340;
			self.y = 200;
			self.hp = 10;
		}
		if (self.gainXp){
			self.xp += self.xpGained;
			self.xpGained = 0;
			self.gainXp = false;
		}
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
	//			handle collision, ex: start dialog sequence.
	// 		}	
	// }
	}
	return self;
}


var Player = function(param) { //This will create a player with the properties in the param object
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.east = 340;
	self.west = 340;
	self.north = 200;
	self.south = 200;
	self.mapHeight = 960;
	self.mapWidth = 960;
	self.maxSpd = 5;
	self.hp = 10;
	self.hpMax = 10;
	self.intro = false;  // This determines if the intro sequence runs.
	self.xp = 0;  // This will increase with any successful action.
	self.collision = function(){

	}
	self.updatePosition = function() {
		var oldX = self.x;
		var oldY = self.y;
		// This tests for collision on the map edges
		if (self.x < (self.width/2)+(screenWidth/2)){  // This was 0, but then the player would be half off the map since the x and y 
			self.west = (self.width/2)+(screenWidth/2);// centered on the player.  This way it stops at the edge of the map.
		}
		if (self.x > self.mapWidth-((self.width/2)+(screenWidth/2))){
			self.east = self.mapWidth-((self.width/2)+(screenWidth/2));
		}
		if (self.y < ((self.height/2)+(screenHeight/2))){
			self.north = ((self.height/2)+(screenHeight/2));
		}
		if (self.y > self.mapHeight-((self.height/2)+(screenHeight/2))){
			self.south = self.mapHeight-((self.height/2)+(screenHeight/2));
		}

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

		// Collision testing
		if (MapList[self.mapFloor].isPositionWall(self)){
			self.x = oldX;
			self.east = oldX;
			self.west = oldX;
			self.y = oldY;
			self.north = oldY;
			self.south = oldY;
		}
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			hpMax:self.hpMax,
			xp:self.xp,
			mapFloor:self.mapFloor,
			mapCeiling:self.mapCeiling,
			height:self.height,
			width:self.width,
		};
	}

	self.getUpdatePack = function(){  // This is sent every frame, compression is important
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			xp:self.xp,
			mapFloor:self.mapFloor,
			mapCeiling:self.mapCeiling,
		};
	}

	Player.list[self.id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}

Player.list = {};


Player.onConnect = function(socket){// This creates player and add listener for movement.
	var mapFloor = 'villageFloor'; // This will need to change.
	var mapCeiling = 'villageCeiling';
	var player = Player({
		id:socket.id,
		mapCeiling:mapCeiling,
		mapFloor:mapFloor, // This overrides the default map in the Entity object with the variable above.
	});	// Player() Calls the object constructor of the player, passing the Math.random
	// number that was assigned to the socket number as the id.  It is passed as an object.
	socket.on('newPositions', function(data) {
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


	socket.on('changeMap', function(data){
		player.mapFloor = data.mapFloor;
		player.mapCeiling = data.mapCeiling;
		player.mapHeight = data.height;
		player.mapWidth = data.width;
		player.x = data.x;
		player.east = data.x;
		player.west = data.x;
		player.y = data.y;
		player.north = data.y;
		player.south = data.y;
	});


	socket.emit('init', {  
		selfId:socket.id,  // The tells the client what player it is.
		player:Player.getAllInitPack(),  // This allows you to see all the players that have already logged in.
		npcs:NPC.getAllInitPack()
	});
}

Player.getAllInitPack = function(){
	var players = [];
	for (var i in Player.list)	{
		players.push(Player.list[i].getInitPack());  // This gets the data from all the players currently online.
	}	
	return players;	
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
		pack.push(player.getUpdatePack());
	}
	return pack;	
}

////////////////////////////////////////// NPC creation and info //////////////////////////////////

var NPC = function(param){
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.toRemove = false;
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number
		};
	}

	self.getUpdatePack = function(){
		return {
			id:player.id,
			x:player.x,
			y:player.y
		};
	}

	NPC.list[id] = self;
	initPack.npc.push(self.getInitPack());
	return self;
};

NPC.list = {};

NPC.update = function(){
	var town = false;  // This will have to be changed to make it work.
	if (town) {
		// put code to remove NPC if you leave a town by changing value to self.toRemove to true
	}
	var pack = [];
	for (var i in NPC.list) {
		var npc = NPC.list[i];
		npc.updatePosition();
			if (npc.toRemove) {
				delete NPC.list[i];
				removePack.npc.push(npc.id);
			} else {
				pack.push(npc.getUpdatePack());
			}
	}
	return pack;
}

NPC.getAllInitPack = function(){
	var npcs = [];
	for (var i in NPC.list)	{
		npcs.push(NPC.list[i].getInitPack());  // This gets the data from all the players currently online.
	}
	return npcs;
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
		if (res.length > 0) { // The find function returns an array with the username and password.
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
		if (res.length > 0) { // The find function returns an array with the username
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
	db.progress.insert({username:data.username,xp:0,intro:true}, function(err){
		cb();
	})
}

var checkIntro = function(data, cb){
	//connecting to mongodb to see if I need to run intro.
	db.progress.find({username:data.username}, function(err, res){
		if (res[0].intro){
			cb(true);
			console.log('database intro true')
		} else {
			cb(false);
			console.log('Database intro false');
			console.log(res);
		}
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
				console.log("signInResponse", true);

				checkIntro(data, function(res){
					if(res){
						console.log("Sending Intro emit package");
						socket.emit('signInResponse', {success:true,intro:true});
					} else {
						console.log('Intro was false')
						console.log(res);
						socket.emit('signInResponse', {success:true,intro:false});
					}
				});

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




