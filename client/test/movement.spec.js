var expect = chai.expect;

socket = {
    emit: sinon.spy()
}

describe('basic tests', function () {

    it('should pass one test', function()  {
       expect(2 + 2).to.equal(4);
    });

});

describe('movement tests', function () {

    it('should emit a movement event for east when greater than 0', function() {
        east(10);
        expect(socket.emit).to.be.calledWith('newPositions', {direction: 'east', endPosition: 10});
    });

    it('should emit a movement event for east when less than 1', function() {
        east(-10);
        expect(socket.emit).to.be.calledWith('newPositions', {direction: 'east', endPosition: 1});
    });

    it('should emit a movement event for east when not a number', function() {
        east("ward");
        expect(socket.emit).to.be.calledWith('newPositions', {direction: 'east', endPosition: 1});
    });
});