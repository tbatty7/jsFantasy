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
        self.intro = false;
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
            if(data.intro){
                console.log("ready to Play Intro");
                playIntro1();//code that runs intro

            } else{
                gameDisplay.style.display = "block";  // This should be called after intro.
                
            }
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

//  INTRO  //

function playIntro1(){
    var div = document.getElementById('dialog'); // This variable is in local scope only, so div won't conflict with other divs.
    div.style.display = "block";
    // div.style.width = '900px';
    // div.style.height = '500px';
    div.innerHTML = '<img class="img-rounded pull-left" src="./client/img/wizard.jpg" alt="no image"/>' +
    '<h3>Old Man: Well hello, looks like you are finally awake.</h3><h3>You: Wha..Where am I?</h3>'+
    '<h3>Old Man: Easy now, there has been a terrible accident, and you were hurt.</h3><h3>You: Where are my friends and family?</h3>'+
    '<h3>Old Man: I am afraid you are the only survivor of your village.</h3><h3>You: What? How did that happen?</h3>' +
    '<h3>Old Man: Whatever happened, it is causing the whole world to decay.  Also, your legs are damaged beyond repair.</h3>' +
    '<h3>You: Is that why I can\'t feel my legs?  What am I going to do now?<h3><h3>Old Man: Hmmm... You know...</h3>' +
    '<button type="button" class="btn btn-warning" onclick="playIntro2()">Continue</button>';
}

function playIntro2(){
    var div = document.getElementById('dialog');
    div.innerHTML = '<h3>Old Man: It\'s strange... I see something in you.</h3>' +
    '<h3>You: What do you mean?</h3><h3>Old Man: I see a glimmer in your eyes. You have code, my friend.</h3><h3>You: Code? What is that?</h3>' +
    '<h3>Old Man: It is what we magicians call magic.  Magic is a lot like writing computer code, in fact, it is almost exactly like it, and you can even get a good job if you know how to use it.</h3>' +
    '<h3>You: Magic? Can that heal me so I can walk again?</h3><h3>Old Man: Unfortunately, no.  But I will teach you some spells so you can move around.</h3>' +
    '<h3>You: Okay. Do I have to call you master?</h3><h3>Old Man: Only if it helps with your training.  Let\'s begin.  Spells are in the form of functions and the first four are north(); south(); east(); and west();...</h3>' +
    '<button type="button" class="btn btn-warning" onclick="playIntro3()">Continue</button>';
}

function playIntro3(){
    var div = document.getElementById('dialog');
    div.innerHTML = '<h1>Lesson One: Functions</h1><h4>Functions are the basic building blocks of JavaScript.</h4>' +
    '<h4>They are the commands that tell the computer what to do.</h4><h4>There are some built in functions in JavaScript, but most of them you need to create in order to use.</h4>' +
    '<h4>To use a function, you need to call it.  You can call a function by typing the function name, and then parenthesis and a semicolon.</h4>' +
    '<h4>Before we start creating functions, we will get some practise just calling them.</h4><h4>To move your character, type <code>east();</code> in the command console.</h4>' +
    '<h4>You can call the other functions north(); south(); and west(); in the same way.</h4><h4>You can also type a number in the parenthesis like this: <code>north(4);</code></h4>' +
    '<h4>This is called passing an argument into a function.  We will talk more about how to create a function so it accepts arguments in a later lesson.</h4>' +
    '<h4>The number you pass as an argument in this function will tell the function how many steps you want to move.  Try it now by clicking the button below and typing it in the command console.</h4>' +
    '<h4>Use the direction functions to go out the door of the hut</h4>' +
    '<button type="button" class="btn btn-success" onclick="endIntro()">Go to Game</button>';
}

function endIntro(){
    var div = document.getElementById('dialog');
    div.style.display = "none";
    gameDisplay.style.display = "block"; 
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
