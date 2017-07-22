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

	$( "textarea#console" ).keydown(function( event ) {
	  if ( event.keyCode === 13 ) {
		  	// var consoleText = document.getElementById('console').value;
		  	var consoleText = $('textarea#console').val();
		  	// var bigConsoleText = document.getElementById('bigConsole').value;
		  	var	bigConsoleText = $('textarea#bigConsoleText').val();

		  	if (consoleText) {
		  		event.preventDefault();

		  		console.log(consoleText);
				$('body').append('<script>' + consoleText + '</script>');

				$('textarea#console').val("");
		  		
		  	} else if (!consoleText){
		  		alert('Please Enter Text in Console below Video Screen before hitting Enter');
		  	}
	  
		
		
		} 
		
	});




});

// function handle(event){
//         event.preventDefault(); // Otherwise the form will be submitted

//         alert("FORM WAS SUBMITTED WITH ENTER");
//     }