$(function(){

	// oldButton();
	bigConsole();
	consoleEnter();
});



var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';

var socket = io();

socket.on('newPositions', function(data) {
	ctx.clearRect(0, 0, 700, 400);
	for (var i = 0; i < data.length; i++) {
		ctx.fillText(data[i].number, data[i].x, data[i].y);
		ctx.fillText("NPC", 20, 20);
	}


});
function east(num) {
	if (num < 1) {
		socket.emit('newPositions', {direction:'east', endPosition: 1});
	} else if (!num) {
		socket.emit('newPositions', {direction:'east', endPosition: 1});
	} else {
		socket.emit('newPositions', {direction:'east', endPosition: num});
	}

}
function west(num) {
	if (num < 1) {
		socket.emit('newPositions', {direction:'west', endPosition: 1});
	} else if (!num) {
		socket.emit('newPositions', {direction:'west', endPosition: 1});
	} else {
		socket.emit('newPositions', {direction:'west', endPosition: num});
	}
}
function north(num) {
	if (num < 1) {
		socket.emit('newPositions', {direction:'north', endPosition: 1});
	} else if (!num) {
		socket.emit('newPositions', {direction:'north', endPosition: 1});
	} else {
		socket.emit('newPositions', {direction:'north', endPosition: num});
	}
}
function south(num) {
	if (num < 1) {
		socket.emit('newPositions', {direction:'south', endPosition: 1});
	} else if (!num) {
		socket.emit('newPositions', {direction:'south', endPosition: 1});
	} else {
		socket.emit('newPositions', {direction:'south', endPosition: num});
	}
}

function consoleEnter() {
	$( "textarea#console" ).keydown(function( event ) {
	  if ( event.keyCode === 13 ) {  // Enter key
		  	// var consoleText = document.getElementById('console').value;
		  	var consoleText = $('textarea#console').val();
		  	// var bigConsoleText = document.getElementById('bigConsole').value;
		  	var	bigConsoleText = $('textarea#bigConsoleText').val();

		  	if (consoleText) {
		  		event.preventDefault();

		  		console.log(consoleText);
				$('body').append('<script>' + consoleText + '</script>'); //should I use append or html here?
				$('#lastCommand').html('<strong>Last Console Command:</strong> "' + consoleText + '"');

				$('textarea#console').val("");
		  		
		  	} else if (!consoleText){
		  		alert('Please Enter Text in Console below Video Screen before hitting Enter');
		  	}
		} 
	});
}

function bigConsole() {
	$('input#submitBigCon').click(function(event){
		event.preventDefault(); // stops form from refreshing screen
		var bigConsoleText = $('textarea#bigConsole').val();
		console.log(bigConsoleText);
		$('#lesson').prepend('<p>' + bigConsoleText + '</p>');
		socket.emit('bigConsoleText', bigConsoleText);
		$('textarea#bigConsole').val("");
		// return bigConsoleText;

	});
}

// function oldButton() {
// 	$('button#submitCon').click(function(event){
// 		event.preventDefault();
// 		var consoleText = $('textarea#console').val();
// 		// console.log(consoleText);
// 		$('#lesson').text('Last Command: ' + consoleText);
// 		socket.emit('consoleText', consoleText);
// 		$('textarea#console').val("");
// 	});

// }


module.exports =   {
	south: south,
	north: north,
	east: east,
	west: west,
	bigConsole: bigConsole,
	consoleEnter: consoleEnter
};