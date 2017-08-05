const assert = require('chai').assert;
const sinon = require('sinon');
const east = require('../../../client/js/jScript').east;
const west = require('../../../client/js/jScript').west;
const north = require('../../../client/js/jScript').north;
const south = require('../../../client/js/jScript').south;
// const bigConsole = require('../../../client/js/jScript').bigConsole;
// const consoleEnter = require('../../../client/js/jScript').consoleEnter;
    
this.jsdom = require('jsdom-global')()
global.$ = global.jQuery = require('jquery');

describe('east', function() {
	it('east should return x value and east', function(){
		let result = east();
		assert.typeOf(result, 'number');
	});

	it('east should return...', function(){
		let result = east(-6);
		
	});
});

describe('west', function() {
	it('west should return x value and west', function(){
		let result = west();
		assert.typeOf(result, 'number');
	});

	it('west should return...', function(){
		let result = west();
	})
});

describe('north', function() {
	it('north should return y value and north', function(){
		let result = north();
		assert.typeOf(result, 'number');
	});

	it('north should return...', function(){
		let result = north();
	})
});

describe('south', function() {
	it('south should return y value and south', function(){
		let result = south();
		assert.typeOf(result, 'number');
	});

	it('south should return...', function(){
		let result = south();
	})
});

describe('bigConsole', function() {
	it('bigConsole should return...', function(){
		let result = bigConsole();
		assert.typeOf(result, 'number');
	});

	it('bigConsole should return...', function(){
		let result = bigConsole();
	});
});

scribe('consoleEnter', function() {
	it('consoleEnter should return...', function(){
		let result = consoleEnter();
		assert.typeOf(result, 'number');
	});

	it('consoleEnter should return...', function(){
		let result = consoleEnter();
	});
});