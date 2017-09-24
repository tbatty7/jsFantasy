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

Maps = function(mapFloor,mapCeiling,width,height,collGrid,doorsGrids){
    var self = {
        mapFloor: mapFloor,
        mapCeiling: mapCeiling,
        width: collGrid[0].length * tileSize,
        height: collGrid.length * tileSize,
        collGrid: collGrid,  // This is a 2 dimension array for a tile map to mark parts of map that you cannot walk over.
        doorsGrids: doorsGrids,  // This is a tile grid of objects which include grids to test for a door and the map name they go to.
    }

    self.isPositionWall = function(pt){  // this interprets your position to what tile you are on and returns true if you should not be there.
    	var gridX = Math.floor(pt.x/tileSize);
    	var gridY = Math.floor(pt.y/tileSize);
    	if (gridX < 0 || gridX >= self.collGrid[0].length){ // This tests if you are outside the map E/W.
    		return true;
    	}
    	if (gridY < 0 || gridY >= self.collGrid.length){  // This tests if you are outside of map N/S
    		return true;
    	}
    	return self.collGrid[gridY][gridX];  // This gives the value of the grid x/y position, if it is 0 or a number.
    	// the y is first because it corresponds to the rows and X is the number of items in each array, aka the columns.
    	// When a boolean value tests for truthy, if there is a value greater than 0, it is true.
    	//the effect of this function is that if it returns a number, that tile has a value and so is an obstruction.
	}	
	self.isPositionDoor = function(pt){  // Would this work for creating a door that will call the changeMap function?
		var gridX = Math.floor(pt.x/tileSize);
		var gridY = Math.floor(pt.y/tileSize);  // These convert the players coords to grid tile coords.
		var coords = 0;
		for (var i = 0; i < self.doorsGrids.length; i++){
			coords += self.doorsGrids[i].grid[gridY][gridX]; //this is checking for a single value, the array selected by gridY,
															// and the item in it with gridX.  If that returns a number, it is true.
			pt.destMap = self.doorsGrids[i].destMap; // This changes the destMap property in the player object to the new one. 
		}		   // The destMap should be sent to the client and when it is, trigger a changemap and an if statement if intro is true.
		return coords;
	}									

    return self;
}



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

function DoorsArrayConstructor(width,height){  // Needs more than 2 arguments, they need to be sets of Tiled array first and destination map second.
	var doorsArray = [];
	// the 3rd argument should be the array, the 4th argument should be the destination map name.
	for (var i = 2; i < arguments.length; i+=2){
		var gridArray = arguments[i];
		var destMap = arguments[i+1];
		var grid = createGrid(width, height, gridArray); // turns Tiled array into grid
		doorsArray.push({grid: grid, destMap: destMap});
		}
	return doorsArray;
}

MapList = {}; //Where the maps will live

//////////// house1Map  Tile Size = {width:34,height:25}   the number of tiles wide and high map is

// the below array was pulled out of the Tiled program saving the file as javascript.
var house1array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 290, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 290, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 290, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 290, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// tha below array is the Tiled single array with the first door map in it.  If there were more doors, I would need more 
var house1_door1array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 308, 308, 308, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 308, 308, 308, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

MapList['house1Floor'] = Maps('house1Floor','house1Ceiling',1088,800,createGrid(34,25,house1array),DoorsArrayConstructor(34,25,house1_door1array,'villageFloor'));


//////////// villageMap  Tile Size = {width:44,height:30};  // Just made up dimensions

// All the data on this need to be checked and corrected.  It just has dummy data in it for now.

MapList['villageFloor'] = Maps('villageFloor','villageCeiling',1088,800,createGrid(34,25,house1array),DoorsArrayConstructor(34,25,house1_door1array,'villageFloor'));


////////////////////////////////////////////  PLAYER  ////////////////////////////////////////////////////

var Entity = function(param){
	var self = {
		x: 340,
		y: 200,
		id: "",
		stepSize: 20,
		xpGained: 0,
		gainXp: 0,
		mapFloor: 'house1Floor',
		mapCeiling: 'house1Ceiling',
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
	self.destMap = 'villageFloor';
	self.maxSpd = 5;
	self.hp = 10;
	self.hpMax = 10;
	self.xp = 0;  // This will increase with any successful action.
	self.intro = false;  // This determines if the intro sequence runs.
	self.collision = function(){
		return;
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

		// Map content Collision testing
		if (MapList[self.mapFloor].isPositionWall(self)){  // This tests truthy if it returns a number it is true.
			self.x = oldX;
			self.east = oldX;
			self.west = oldX;
			self.y = oldY;
			self.north = oldY;
			self.south = oldY;
		}
		if (MapList[self.mapFloor].isPositionDoor(self)){
			// push the self.destMap value along with this if it is true
			self.destMap = MapList[self.mapFloor].destMap;
			
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
		player.mapCeiling = MapList[data.mapFloor].mapCeiling;
		player.mapHeight = MapList[data.mapFloor].height;
		player.mapWidth = MapList[data.mapFloor].width;
	// If I change the below directions in player directly, the map change from client will work, but will map change 
	// from server work?
	// Map change from client is when a dialog ends and the map is changed, like when you are talking to someone.
	// Do I need to have this at all?  If I have the map collision set for doors it will automatically change the map, 
	// but then when dialog happens, It will hide the map and display the dialog, so the end of dialog can be just the 
	// showing of the map again.  So the only time I need the changemap is in the server.  The function that is called
	// when the door event is pulled can be controlled by that event in the map with a playerX and playerY.
	// this changemap function should be eliminated.

	// The map change should only happen on the server side.  I need to add x and y to the door grid array so when 
	// the ispositiondoor function is called, it also changes the x and y.
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




