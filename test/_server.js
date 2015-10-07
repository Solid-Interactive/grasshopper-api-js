'use strict';

var env = require('./config/environment')();
require('chai').should();

describe('api.content', function(){


    var database = "is not ready";

    before(function(done){
        var grasshopper = require('../lib/grasshopper-api')(env);
        grasshopper.core.event.channel('/system/db').on('start', function(payload, next) {
            next();
            console.log('db ready - moving on with tests - server will remain running for duration of all tests.');
            database = "ready";
            done();
        });
    });

    it('database should be ready', function(){
       database.should.equal("ready");
    });
});
