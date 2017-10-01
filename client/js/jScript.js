var socket;
var Img;
var ctx;
var Player;

var lastXP = null;
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
    Img.player.src = '/client/img/one-soldier.png';
    Img.npc = new Image();
    Img.npc.src = '/client/img/one-player.png';
    Img.mapFloor = {};
    Img.mapFloor['villageFloor'] = new Image();
    Img.mapFloor['villageFloor'].src = '/client/img/villageFloor.png';
    Img.mapFloor['house1Floor'] = new Image();
    Img.mapFloor['house1Floor'].src = '/client/img/house1floor.png';
    Img.mapCeiling = {};
    Img.mapCeiling['villageCeiling'] = new Image();
    Img.mapCeiling['villageCeiling'].src = '/client/img/villageCeiling.png';  // Need to add something here?  Treetops?
    Img.mapCeiling['house1Ceiling'] = new Image();
    Img.mapCeiling['house1Ceiling'].src = '/client/img/house1ceiling.png';
}

function drawMapFloor() {
    var player = Player.list[selfId];  // The selfId tells the client which player is logged.
    var x = screenWidth/2 - player.x;
    var y = screenHeight/2 - player.y;
    ctx.drawImage(Img.mapFloor[player.mapFloor],x,y);  // this draws the map for the logged player.
}

function drawMapCeiling() {
    var player = Player.list[selfId];  // The selfId tells the client which player is logged.
    var x = screenWidth/2 - player.x;
    var y = screenHeight/2 - player.y;
    ctx.drawImage(Img.mapCeiling[player.mapCeiling],x,y);  // this draws the map for the logged player.
}

function drawSideUI() {
    // ctx.fillStyle = 'white';
    // ctx.fillText('XP: ' + Player.list[selfId].xp,30,30); // Puts xp in canvas, I want it outside?
    if(lastXP != Player.list[selfId].xp){
    lastXP = Player.list[selfId].xp;
    $('#xp').append('<h1 class="clearfix">' + Player.list[selfId].xp + '</h1>');
    }
    // I can add other UI display items here.
}


function initSocketIo() {  // When initSocketIo is called, it creates the player & npc object on the client side.
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
        self.mapFloor = initPack.mapFloor;
        self.mapCeiling = initPack.mapCeiling;
        self.height = initPack.height;
        self.width = initPack.width;

        self.draw = function(){
            if(Player.list[selfId].mapFloor !== self.mapFloor){
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
        }

        Player.list[self.id] = self;
        return self;
    }
    Player.list = {};



    socket.on('init', function(data){
        if (data.selfId) {
            selfId = data.selfId;
            console.log(data);
        }

        for (var i = 0; i < data.player.length; i++) {
            new Player(data.player[i]);
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
                if (pack.mapFloor !== undefined) {
                    p.mapFloor = pack.mapFloor;
                }
                if (pack.mapCeiling !== undefined) {
                    p.mapCeiling = pack.mapCeiling;
                }
                if (pack.destMap !== undefined) {
                    if (p.intro){
                        secondIntro();  // for when you leave the first house.
                    } else {
                        p.mapFloor = pack.destMap;
                    }
                }
                // Is this where I need to put the test: if player intro is true and if isPositionDoor is true, run SecondIntro();?
                // This is updating the players position each frame and changing maps, and 
            }
        }
        

        // for (var i in NPC.list){
        //     if (i === undefined && data.npc[0]){
        //         if(i === data.npc[i].id){
        //                         console.log("creating NPC at Client through update")

        //         }
        //     } 
        // }
        // if (NPC.list[data.npc[0].id] !== 1){
        //     console.log("creating NPC at Client through update")
        //     console.log(data.npc);
        //     for (var i = 0; i < data.npc.length; i++) {
        //         new NPC(data.npc[i]);
        //     }
        // }  

        for(var i = 0; i < data.npc.length; i++) { // If there is no data in npc.length
            var pack = data.npc[i];
            var n = NPC.list[pack.id]; 

            if(n) {   // This is saying if there is an npc in the NPC.list with the same id as the id in the data.npc, 
                if (pack.x !== undefined) {   // then update x and y.
                    n.x = pack.x;
                }
                if (pack.y !== undefined) {
                    n.y = pack.y;
                }

            } else {   // This is saying if there is no npc in NPC.list with this id, create the npc.
                new NPC(pack);  
                console.log("created NPC on client side")
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

var NPC = function(initPack) {  // This is for NPCs.
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.mapFloor = initPack.mapFloor;
    // self.mapCeiling = initPack.mapCeiling;

    self.draw = function(){  // This should be close to what it shows in the Player object draw function with a picture.
        if(Player.list[selfId].mapFloor !== self.mapFloor){  // This tells the client not to show NPC if their maps do not match.
            return;
        }
        var x = self.x - Player.list[selfId].x + screenWidth/2; // This keeps the NPC tied to the map when the player moves.
        var y = self.y - Player.list[selfId].y + screenHeight/2;  // technically the map is moving when the player moves.

        // ctx.fillRect(x, y, 30, 34); // draws npc as red box
        var width = Img.npc.width;  //  this is where you can enlarge or shrink the player image
        var height = Img.npc.height; // by multiplying or dividing the width and height by 2 or more

        ctx.drawImage(Img.npc,0,0,Img.npc.width,Img.npc.height,x-width/2,y-height/2,width,height);

    }

    NPC.list[self.id] = self;
    return self;
}
NPC.list = {};


function drawblock(){
    // ctx.fillRect(600, 365, 30, 34); 
}

    // New animation loop

    setInterval(function() {
        if (!selfId){
            return;
        }
        ctx.clearRect(0,0,screenWidth,screenHeight);
        drawMapFloor();
        drawSideUI();
        for (var i in Player.list) {
            Player.list[i].draw();
        }
        for (var i in NPC.list) {
            NPC.list[i].draw();
        }
        drawblock();
        drawMapCeiling();
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
                // Question - should I set the player.intro to data.intro here, or in the update loop?
                console.log("ready to Play Intro");
                playIntro1("./client/img/wizard.jpg");//code that runs intro

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


function playIntro1(image){
    
    one();

    function one(){
        // image,text,[responses],[cb]
        dialog(image,"Old Man: Well hello, looks like you are finally awake.","Wha..Where am I?", two);
    }

    function two(){
        // image,text,[responses],[cb]
        dialog(image,'Old Man: Easy now, there has been a terrible accident, and you were hurt.',"Where are my friends and family?", three);
    }

    function three(){
        // image,text,[responses],[cb]
        dialog(image,"Old Man: I am afraid you are the only survivor of your village.","What? How did that happen?", four);
    }

    function four(){image
        // image,text,[responses],[cb]
        dialog(image,"Old Man: Whatever happened, it is causing the whole world to decay.  Also, your legs are damaged beyond repair.","Is that why I can\'t feel my legs?  What am I going to do now?", five);
    }

    function five(){
        // image,text,[responses],[cb]
        dialog(image,"Old Man: Hmmm... You know...It\'s strange... I see something in you.","What do you mean?", six);
    }

    function six(){
        // image,text,[responses],[cb]
        dialog(image,"Old Man: I see a glimmer in your eyes. You have code, my friend.","Code? What is that?", seven);
    }

    function seven(){
        // image,text,[responses],[cb]
        dialog(image,"Old Man: It is what we Scriptgicians call magic.  Magic is a lot like writing computer code, in fact, it is almost exactly like it","Magic? Can that heal me so I can walk again?", eight);
    }

    function eight(){
        // image,text,[responses],[cb]
        dialog(image,"Old Man: Unfortunately, no.  But I will teach you some spells so you can move around.","Okay. Do I have to call you master?", nine);
    }

    function nine(){
        // image,text,[responses],[cb]
        dialog(image,"Old Man: Only if it helps with your training.  Let\'s begin.  Spells are in the form of functions and the first four are north(); south(); east(); and west();...</h3>","Wha..Where am I?", LessonOne_Functions);
    }

}


function LessonOne_Functions(){
    var div = document.getElementById('dialog');
    div.innerHTML = '<h1>Lesson One: Functions</h1><h4>Functions are the basic building blocks of JavaScript.</h4>' +
    '<h4>They are the commands that tell the computer what to do.</h4><h4>There are some built in functions in JavaScript, but most of them you need to create in order to use.</h4>' +
    '<h4>To use a function, you need to call it.  You can call a function by typing the function name, and then parenthesis and a semicolon.</h4>' +
    '<h4>Before we start creating functions, we will get some practise just calling them.</h4><h4>To move your character, type <code>east();</code> in the command console.</h4>' +
    '<h4>You can call the other functions north(); south(); and west(); in the same way.</h4><h4>You can also type a number in the parenthesis like this: <code>north(4);</code></h4>' +
    '<h4>This is called passing an argument into a function.  We will talk more about how to create a function so it accepts arguments in a later lesson.</h4>' +
    '<h4>The number you pass as an argument in this function will tell the function how many steps you want to move.  Try it now by clicking the button below and typing it in the command console.</h4>' +
    '<h4>Use the direction functions to go out the door of the hut</h4>' +
    '<button type="button" class="btn btn-success" onclick="pauseIntro()">Go to Game</button>';
}

function pauseIntro(){
    // changeMap('house1Floor', 620, 365);  This is decremented.
    var div = document.getElementById('dialog'); // This variable is in local scope only, so div won't conflict with other divs.
    div.style.display = "none";
    gameDisplay.style.display = "block"; 
}

function secondIntro(){  // Have this called when there is a collision when the player connects with the door
    // changeMap('villageFloor', 620,365);  These are now decremented
    var div = document.getElementById('dialog'); // This variable is in local scope only, so div won't conflict with other divs.
    div.innerHTML = '<img class="img-rounded pull-left" src="./client/img/wizard.jpg" alt="no image"/>' +
    "and you can even get a good job if you know how to use it." +
    '<h3>Old Man: Well hello, looks like you are finally awake.</h3><h3>You: Wha..Where am I?</h3>'+
    '<h3>Old Man: Easy now, there has been a terrible accident, and you were hurt.</h3><h3>You: Where are my friends and family?</h3>'+
    '<h3>Old Man: I am afraid you are the only survivor of your village.</h3><h3>You: What? How did that happen?</h3>' +
    '<h3>Old Man: Whatever happened, it is causing the whole world to decay.  Also, your legs are damaged beyond repair.</h3>' +
    '<h3>You: Is that why I can\'t feel my legs?  What am I going to do now?<h3><h3>Old Man: Hmmm... You know...</h3>' +
    '<button type="button" class="btn btn-warning" style="width:300px;" onclick="playIntro2()">Continue</button>';
    gameDisplay.style.display = "none"; 
    div.style.display = "block";
}

function endIntro(){
    var div = document.getElementById('dialog');
    div.style.display = "none";
    gameDisplay.style.display = "block"; 

    // send back to server to tell it to change the intro: value to false in MongoDB.
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

                                                     //  UI  //

// This will take an image of the npc you are talking with, the text of what they say, then a response, then the callback
// for that response, then you can put another response, and the corresponding callback so you can choose from two different
// responses.
function dialog(image,text,response,cb){ 
    var div = document.getElementById('dialog'); 
    div.style.display = "block";
    div.innerHTML = '<img class="img-rounded img-responsive center-block" style="width:auto;height:400px;" src="' + image + '" alt="no image"/>' +
    '<div class="alert alert-danger text-center" id="responses"><h3>'+ text + '</h3>' +
    '<button type="button" class="btn btn-warning btn-lg" id="resp1">'+ response +'</button></div>';
    $('#resp1').click(cb);
    var responses = document.getElementById('responses');
    if(arguments.length === 5){
    responses.appendChild('<button type="button" class="btn btn-success btn-lg" id="resp2">'+ arguments[4] +'</button>');
    $('#resp2').click(arguments[5]);
    }
    if(arguments.length === 7){  // .length is the count of arguments, but the arguments[2] is the index of arguments.
    responses.appendChild('<button type="button" class="btn btn-info btn-lg" id="resp3">'+ arguments[6] +'</button>');
    $('#resp3').click(arguments[7]);
    }

}

function changeMap(mapFloor,x,y){  // No longer needed.  The door array changes the maps.
    socket.emit('changeMap', {mapFloor: mapFloor,x:x,y:y});
}

function testCollision(rect1, rect2){
    return rect1.x <= rect2.x + rect2.width
    &&  rect2.x <= rect1.x + rect1.width
    &&  rect1.y <= rect2.y + rect2.height
    &&  rect2.y <= rect1.y + rect1.height;
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
        } else if (consoleText[0] === "@"){  // The consoleText[0] checks the same thing as consoleText.substring(0,1)
            sendPm(consoleText);                    // They both check the first character of the message typed in the window.
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

function sendPm(data){  // data expected is @username,message
    socket.emit('sendPmToServer', {
        username: data.slice(1, data.indexOf(',')),  // This cuts the name out of the string, assuming a comma is after it.
        // The indexOf(',') gives the index number in the string of where the comma is.
        message: data.slice(data.indexOf(',')+1) // This cuts out everything after the comma and assigns it to message.
    });  
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
   document.oncontextmenu = function(event){ // This makes the right click not pull up a menu on the screen.
    event.preventDefault();
   }
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
