$(function(){

	$('button#submitCon').click(function(event){
		event.preventDefault();
		var consoleText = $('textarea#console').val();
		// console.log(consoleText);
		$('#lesson').prepend('<p>' + consoleText + '</p>');
		socket.emit('consoleText', consoleText);
		$('textarea#console').val("");
	});

	$('input#submitBigCon').click(function(event){
		event.preventDefault();
		var bigConsoleText = $('textarea#bigConsole').val();
		console.log(bigConsoleText);
		$('#lesson').prepend('<p>' + bigConsoleText + '</p>');
		socket.emit('bigConsoleText', bigConsoleText);
		$('textarea#bigConsole').val("");
		// return bigConsoleText;

	});


// function east(num) {
	
// }


});

// function handle(event){
//         event.preventDefault(); // Otherwise the form will be submitted

//         alert("FORM WAS SUBMITTED WITH ENTER");
//     }