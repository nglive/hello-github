var should = require('should');
var assert = require('assert');
var request = require('supertest');

// git: 1 added some more random code for github playing around
describe('Appearances GET route', function(){
	it('responds with json', function(done){
		request('http://localhost:8080/presence/v3/listings')
		.get('/467152316/appearances')
		.expect('Content-Type', /json/)
		.expect(200,done);
	})
})