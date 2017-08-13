var expect = chai.expect;
var socket = { emit: function(){}};
var emit;

describe('basic tests', function () {

    it('should pass one test', function()  {
       expect(2 + 2).to.equal(4);
    });

});

describe('movement tests', function () {
    beforeEach(function(){

        emit = sinon.stub(socket, 'emit');
    });

    afterEach(function(){
        emit.restore();
    });

    it('should emit a movement event for east when greater than 0', function() {
        east(10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'east', endPosition: 10});
    });

    it('should emit a movement event for east when less than 1', function() {
        east(-10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'east', endPosition: 1});
     });

    it('should emit a movement event for east when not a number', function() {
        east("ward");
        expect(emit).to.be.calledWith('newPositions', {direction: 'east', endPosition: 1});
    });

    it('should emit a movement event for west when greater than 0', function() {
        west(10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'west', endPosition: 10});
    });

    it('should emit a movement event for west when less than 1', function() {
        west(-10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'west', endPosition: 1});
    });

    it('should emit a movement event for west when not a number', function() {
        west("ward");
        expect(emit).to.be.calledWith('newPositions', {direction: 'west', endPosition: 1});
    });

    it('should emit a movement event for north when greater than 0', function() {
        north(10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'north', endPosition: 10});
    });

    it('should emit a movement event for north when less than 1', function() {
        north(-10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'north', endPosition: 1});
    });

    it('should emit a movement event for north when not a number', function() {
        north("ward");
        expect(emit).to.be.calledWith('newPositions', {direction: 'north', endPosition: 1});
    });

    it('should emit a movement event for south when greater than 0', function() {
        south(10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'south', endPosition: 10});
    });

    it('should emit a movement event for south when less than 1', function() {
        south(-10);
        expect(emit).to.be.calledWith('newPositions', {direction: 'south', endPosition: 1});
    });

    it('should emit a movement event for south when not a number', function() {
        south("ward");
        expect(emit).to.be.calledWith('newPositions', {direction: 'south', endPosition: 1});
    });
});
