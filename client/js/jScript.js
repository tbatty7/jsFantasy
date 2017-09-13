var socket;
var Img;
var ctx;
var Player;
var selfId = null;
var screenWidth = 700;
var screenHeight = 400;

function initCtx() {  // Initializes canvas screen 
    ctx = document.getElementById("ctx").getContext("2d");
    ctx.font = '30px Arial';
}

function initImage() {
    Img = {};
    Img.player = new Image();
    Img.player.src = '/client/img/one-player.png';
    Img.npc = new Image();
    Img.npc.src = '/client/img/one-soldier.png';
    Img.map = {};
    Img.map['village'] = new Image();
    Img.map['village'].src = '/client/img/village.png';
    Img.map['house1'] = new Image();
    Img.map['house1'].src = '/client/img/house1.png';
}

function drawMap() {
    var player = Player.list[selfId];  // The selfId tells the client which player is logged.
    var x = screenWidth/2 - player.x;
    var y = screenHeight/2 - player.y;
    ctx.drawImage(Img.map[player.map],x,y);  // this draws the map for the logged player.
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.fillText('XP: ' + Player.list[selfId].xp,30,30); // Puts xp in canvas, I want it outside?
}

function initSocketIo() {
    socket = io();

//init package - when new stuff created, contains all the data, sent only once

    Player = function(initPack) {
        var self = {};
        self.id = initPack.id;
        self.number = initPack.number;
        self.x = initPack.x;
        self.y = initPack.y;
        self.hp = initPack.hp;
        self.hpMax = initPack.hpMax;
        self.xp = initPack.xp;
        self.map = initPack.map;

        self.draw = function(){
            if(Player.list[selfId].map !== self.map){
                return;
            }
            var x = self.x - Player.list[selfId].x + screenWidth/2;
            var y = self.y - Player.list[selfId].y + screenHeight/2;

            var hpWidth = 30 * self.hp / self.hpMax; 
            ctx.fillStyle = 'red'; // Changes hp bar to red.
            ctx.fillRect(x - hpWidth/2, y - 40, hpWidth, 4); // Draws hp bar over player

            var width = Img.player.width;  //  this is where you can enlarge or shrink the player image
            var height = Img.player.height; // by multiplying or dividing the width and height by 2 or more


            ctx.drawImage(Img.player,0,0,Img.player.width,Img.player.height,x-width/2,y-height/2,width,height);

            // ctx.fillText(self.xp,self.x,self.y-60);  // Draws XP number above player.
        }

        Player.list[self.id] = self;
        return self;
    }
    Player.list = {};

    var NPC = function(initPack) {  // This is for NPCs.
        var self = {};
        self.id = initPack.id;
        self.x = initPack.x;
        self.y = initPack.y;
        self.map = initPack.map;

        self.draw = function(){  // This should be close to what it shows in the Player object draw function with a picture.
            if(Player.list[selfId].map !== self.map){
                return;
            }
            var x = self.x - Player.list[selfId].x + screenWidth/2;
            var y = self.y - Player.list[selfId].y + screenHeight/2;

            ctx.fillText(self.number, x, y);  // Draws player
        }

        NPC.list[self.id] = self;
        return self;
    }
    NPC.list = {};

    socket.on('init', function(data){
        if (data.selfId) {
            selfId = data.selfId;
        }

        for (var i = 0; i < data.player.length; i++) {
            new Player(data.player[i]);
        }
        if (data.NPC !== undefined){
            for (var i = 0; i < data.NPC.length; i++) {
                new NPC(data.npc[i]);
            }
        }    
    });

    //update package - only contains the difference, sent every frame, only has data if a change happens.

    socket.on('update', function(data){
        // data received will look like this: {player: [{id:123,x:0,y:0}, {id:222,x:0,y:2}], npc: [{id:a1,x:10,y:14}]}
        for(var i = 0; i < data.player.length; i++) {
            var pack = data.player[i];
            var p = Player.list[pack.id];
            if(p) {
                if (pack.x !== undefined) {
                    p.x = pack.x;
                }
                if (pack.y !== undefined) {
                    p.y = pack.y;
                }
                if (pack.hp !== undefined) {
                    p.hp = pack.hp;
                }
                if (pack.xp !== undefined) {
                    p.xp = pack.xp;
                }
            }
        }
        
        for(var i = 0; i < data.npc.length; i++) {
            var pack = data.npc[i];
            var n = NPC.list[pack.id];
            if(n) {
                if (pack.x !== undefined) {
                    n.x = pack.x;
                }
                if (pack.y !== undefined) {
                    n.y - pack.y;
                }
            }
        }

    });


    //remove package - removes player or npc with id

    socket.on('remove', function(data) {
        // Data received will look like this: {player:[123],npc[a1]}
        for (var i = 0; i < data.player.length; i++) {
            delete Player.list[data.player[i]];
        }
        for (var i = 0; i < data.npc.length; i++) {
            delete NPC.list[data.npc[i]];  // Do I want to delete NPCs?
        }
    });

    // New animation loop

    setInterval(function() {
        if (!selfId){
            return;
        }
        ctx.clearRect(0,0,screenWidth,screenHeight);
        drawMap();
        drawScore();
        for (var i in Player.list) {
            Player.list[i].draw();
        }
        for (var i in NPC.list) {
            NPC.list[i].draw();
        }
    }, 40);

} 

    var signDivSignIn = $('#signIn');
    var signDivSignUp = $('#signUp');
    var signDivPassword = document.getElementById('password');
    var signDivUserName = document.getElementById('userName');
    var signDivEmail = document.getElementById('email');
    var signDiv = document.getElementById('logonDisplay');

    signDivSignIn.click(function(event){
        event.preventDefault();
        socket.emit('signIn', {username:signDivUserName.value, password:signDivPassword.value});
    });

    signDivSignUp.click(function(event){
        event.preventDefault();
        socket.emit('signUp', {username:signDivUserName.value, password:signDivPassword.value});
    });

function initSignIn(){
    
    socket.on('signInResponse', function(data){
        console.log(data);
        if(data.success){
            logonDisplay.style.display = "none";
            gameDisplay.style.display = "block";

        } else {
            alert("Sign In Unsuccessful");
        }
    });
}

function initSignUp(){
    
    socket.on('signUpResponse', function(data){
        console.log(data);
        if(data.success){
            alert("Sign Up Successful");

        } else {
            alert("User Name Taken");
        }
    });
}





function initChat(){
    socket.on('addToChat', function(data){
        $('#chat').prepend('<p>' + data + '</p>');
    });
}

function initEval(){
    socket.on('evalAnswer', function(data){
        console.log(data);
    });
}

function sendChat(){
    var consoleText = $('textarea#console').val().slice(2);
    socket.emit('sendMsgToServer', consoleText);
    $('textarea#console').val("");
}

function sendEval(){
    var consoleText = $('textarea#console').val().slice(1);
    socket.emit('evalServer', consoleText);
    $('textarea#console').val("");
}

function east(num) {
	if (num < 1) {
        socket.emit('newPositions', {direction: 'east', endPosition: 1});
    } else if (!num) {
        socket.emit('newPositions', {direction: 'east', endPosition: 1});
    } else if (isNaN(num)) {
    	socket.emit('newPositions', {direction: 'east', endPosition: 1});
    } else {
        socket.emit('newPositions', {direction: 'east', endPosition: num});
    }
}
function west(num) {
    if (num < 1) {
        socket.emit('newPositions', {direction: 'west', endPosition: 1});
    } else if (!num) {
        socket.emit('newPositions', {direction: 'west', endPosition: 1});
    } else if (isNaN(num)) {
    	socket.emit('newPositions', {direction: 'west', endPosition: 1});
    } else {
        socket.emit('newPositions', {direction: 'west', endPosition: num});
    }
}
function north(num) {
    if (num < 1) {
        socket.emit('newPositions', {direction: 'north', endPosition: 1});
    } else if (!num) {
        socket.emit('newPositions', {direction: 'north', endPosition: 1});
    } else if (isNaN(num)) {
    	socket.emit('newPositions', {direction: 'north', endPosition: 1});
    } else {
        socket.emit('newPositions', {direction: 'north', endPosition: num});
    }
}
function south(num) {
    if (num < 1) {
        socket.emit('newPositions', {direction: 'south', endPosition: 1});
    } else if (!num) {
        socket.emit('newPositions', {direction: 'south', endPosition: 1});
    } else if (isNaN(num)) {
    	socket.emit('newPositions', {direction: 'south', endPosition: 1});
    } else {
        socket.emit('newPositions', {direction: 'south', endPosition: num});
    }
}

function handleEnter(event) {
    if (event.keyCode === 13) {  // Enter key
        // var consoleText = document.getElementById('console').value;
        var consoleText = $('textarea#console').val();
        // var bigConsoleText = document.getElementById('bigConsole').value;
        var bigConsoleText = $('textarea#bigConsoleText').val();
        event.preventDefault();
        if (consoleText.substring(0,2) === "//") {
            sendChat();
        } else if (consoleText.substring(0,1) === "/") {
            sendEval();
        } else if (consoleText) {
            console.log(consoleText);
            $('body').append('<script>' + consoleText + '</script>');
            $('#lastCommand').html('<strong>Last Command:</strong> "' + consoleText + '"');

            $('textarea#console').val("");
            document.getElementById('consoleScript').nextElementSibling.remove();
        } else if (!consoleText) {
            alert('Please Enter Text in Console below Video Screen before hitting Enter');
        }
    }
    
}

function handleConsole(event) {
    event.preventDefault(); // stops form from refreshing screen
    var bigConsoleText = $('textarea#bigConsole').val();
    console.log(bigConsoleText);
    $('#chat').prepend('<p>' + bigConsoleText + '</p>');
    socket.emit('bigConsoleText', bigConsoleText);
    $('textarea#bigConsole').val("");
    // return bigConsoleText;
}

// function handleOldButton(event) {
//     event.preventDefault();
//     var consoleText = $('textarea#console').val();
//     // console.log(consoleText);
//     $('#lesson').text('Last Command: ' + consoleText);
//     socket.emit('consoleText', consoleText);
//     $('textarea#console').val("");
// }

function initKeyActions() {
    $("textarea#console").keydown(handleEnter);
    $('input#submitBigCon').click(handleConsole);
   // $('button#submitCon').click(handleOldButton);
}

function init() {
    initCtx();
    initSocketIo();
    initImage();
    initKeyActions();
    initChat();
    initEval();
    initSignIn();
    initSignUp();
}
