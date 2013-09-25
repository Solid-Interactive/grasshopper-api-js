var should = require('chai').should();
var request = require('supertest');

describe('api.contentTypes', function(){
    var url = 'http://localhost:8080',
        testContentTypeId  = "523b76ac9dab8eea41000001",
        readerToken = "",
        adminToken  = "";

    beforeEach(function(done){
        request(url)
            .get('/token')
            .set('Accept', 'application/json')
            .set('Accept-Language', 'en_US')
            .set('authorization', new Buffer('apitestuseradmin:TestPassword').toString('base64'))
            .end(function(err, res) {
                if (err) { throw err; }
                adminToken = res.body.access_token;

                request(url)
                    .get('/token')
                    .set('Accept', 'application/json')
                    .set('Accept-Language', 'en_US')
                    .set('authorization', new Buffer('apitestuserreader:TestPassword').toString('base64'))
                    .end(function(err, res) {
                        if (err) { throw err; }
                        readerToken = res.body.access_token;
                        done();
                    });
            });
    });

    describe("GET: " + url + '/contentTypes/:id', function() {
        it('should return 401 because trying to access unauthenticated', function(done) {

            request(url)
                .get('/contentTypes/' + testContentTypeId)
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(401);
                    done();
                });
        });
        it('should return a 403 because user does not have permissions to access content types', function(done) {
            request(url)
                .get('/contentTypes/' + testContentTypeId)
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + readerToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(403);
                    done();
                });
        });
        it('should return an existing content type', function(done) {
            request(url)
                .get('/contentTypes/' + testContentTypeId)
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    res.body.login.should.equal("apitestuser");
                    done();
                });
        });
        it('should return 404 because test user id does not exist', function(done) {
            request(url)
                .get('/contentTypes/faketypeid')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(404);
                    done();
                });
        });
    });

    describe("GET: " + url + '/contentTypes', function() {
        it('should return a list of content types with the default page size', function(done) {
            request(url)
                .get('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    res.body.should.have.property('total');
                    res.body.should.have.property('results');
                    done();
                });
        });
        it('should a list of content types with the specified page size', function(done) {
            request(url)
                .get('/contentTypes?limit=1&skip=0')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    res.body.should.have.property('total');
                    res.body.should.have.property('results');
                    done();
                });
        });
        it('should return a 403 because user does not have permissions to access content types', function(done) {
            request(url)
                .get('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + readerToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(403);
                    done();
                });
        });
        it('should return an empty list if the page size and current requested items are out of bounds.', function(done) {
            request(url)
                .get('/contentTypes?limit=1&skip=100000')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    res.body.should.have.property('total');
                    res.body.should.have.property('results');
                    done();
                });
        });
        it('should return a 401 because user is not authenticated', function(done) {
            request(url)
                .get('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(401);
                    done();
                });
        });
    });

    describe("POST: " + url + '/contentTypes', function() {
        it('should create a content type without an error using correct verb.', function(done){
            /*var newUser = {
                login: "newtestuser1",
                role: "reader",
                enabled: true,
                email: "newtestuser1@thinksolid.com",
                name: "Test User",
                password: "TestPassword"
            };
            request(url)
                .post('/users')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newUser)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    res.body.should.have.property('_id');
                    done();
                });*/
        });

        it('should return error if a content type id is sent with the request (maybe verb error).', function(done){
            var newUser = {
                _id: "ISHOULDNOTBEHERE",
                login: "newtestuser1",
                role: "reader",
                enabled: true,
                email: "newtestuser2@thinksolid.com",
                name: "Test User",
                password: "TestPassword"
            };
            /*
            request(url)
                .post('/users')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newUser)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });*/
        });

        it('should return error if a duplicate is created.', function(done){
            var newUser = {
                login: "newtestuser1",
                role: "reader",
                enabled: true,
                email: "newtestuser1@thinksolid.com",
                name: "Test User",
                password: "TestPassword"
            };/*
            request(url)
                .post('/users')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newUser)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });*/
        });

        it('should validate and return error if a mandatory property is missing.',function(done){
            var newUser = {
                role: "reader",
                enabled: true,
                email: "newtestuser1@thinksolid.com",
                name: "Test User",
                password: "TestPassword"
            };
            /*
            request(url)
                .post('/users')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newUser)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });*/
        });

    });

    describe("PUT: " + url + '/contentTypes', function() {

    });

    describe("DELETE: " + url + '/contentTypes', function() {
        it('should return a 403 because user does not have permissions to access content types', function(done) {
            false.should.equal(true);done();
        });
        it('should delete a content type using the correct verb', function(done) {
            false.should.equal(true);done();
        });
        it('should delete a content type using the method override', function(done) {
            false.should.equal(true);done();
        });

        it('should return 200 when we try to delete a content type that doesn\'t exist', function(done) {
            false.should.equal(true);done();
        });
    });
});