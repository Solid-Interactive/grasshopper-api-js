var should = require('chai').should();
var request = require('supertest');

describe('api.contentTypes', function(){
    var url = 'http://localhost:8080',
        testContentTypeId  = "524362aa56c02c0703000001",
        readerToken = "",
        adminToken  = "",
        testCreatedContentTypeId = "",
        testCreatedContentTypeCustomVerb = "";

    before(function(done){
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
                    res.body.label.should.equal("This is my test content type");
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
        /*@@ VERIFIED */
        it('should create a content type without an error using correct verb.', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testfield",
                        required: true,
                        label: "Title",
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    res.body.should.have.property('_id');
                    testCreatedContentTypeId = res.body._id;
                    done();
                });
        });

        it('should create a content type without an error using correct verb. supplying fields and meta info', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testfield",
                        required: true,
                        label: "Title",
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testfield",
                    required: true,
                    label: "Title",
                    instancing: 1,
                    type: "textbox"
                }],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    res.body.should.have.property('_id');
                    testCreatedContentTypeCustomVerb = res.body._id;
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return an error because we are missing a "label" field.', function(done){
            var newContentType = {
                fields: [
                    {
                        id: "testid",
                        required: true,
                        label: "Title",
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error if a content type id is sent with the request (maybe verb error).', function(done){
            var newContentType = {
                _id: "ISHOULDNOTBEHERE",
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        required: true,
                        label: "Title",
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };

            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed field id is passed in (id has a space).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "test id",
                        label: "This is a test label",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a field has a duplicate id', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testfield",
                        label: "This is a test label",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                    },
                    {
                        id: "testfield",
                        label: "This is a test label",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed field is passed in (missing label).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed field is passed in (missing type).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        required: true,
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed field is passed in (invalid type).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        type: "I DONT EXIST",
                        required: true,
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed meta id is passed in (id has a space).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        label: "This is a test label",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmeta id",
                    label: "Test Field Label",
                    type: "textbox",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a meta has a duplicate id', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testfield",
                        label: "This is a test label",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    label: "Test Field Label",
                    type: "textbox",
                    required: true,
                    instancing: 1
                },{
                        id: "testmetaid",
                        label: "This is a test label",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                }],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed meta is passed in (missing label).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        label: "My Label",
                        required: true,
                        instancing: 1,
                        type: "textbox"
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    type: "I DO NOT EXIST",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed meta is passed in (missing type).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        required: true,
                        type: "textbox",
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    label: "Test Field Label",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

        /*@@ VERIFIED */
        it('should return error when a malformed meta is passed in (invalid type).', function(done){
            var newContentType = {
                label: "newtestsuitecontent",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        type: "textbox",
                        required: true,
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    label: "Test Field Label",
                    type: "I DO NOT EXIST",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };
            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });
    });

    describe("PUT: " + url + '/contentTypes', function() {
        it('should return a 403 because user does not have permissions to access users', function(done) {
            var newContentType = {
                _id: testCreatedContentTypeId,
                label: "updatedlabel",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        type: "textbox",
                        required: true,
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    label: "Test Field Label",
                    type: "textbox",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };

            request(url)
                .put('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + readerToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(403);
                    done();
                });
        });
        it('should update a content type using the correct verb', function(done) {
            var newContentType = {
                _id: testCreatedContentTypeId,
                label: "updatedlabel",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        type: "textbox",
                        required: true,
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    label: "Test Field Label",
                    type: "textbox",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };

            request(url)
                .put('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    done();
                });
        });

        it('should update a content type using the method override', function(done) {
            var newContentType = {
                _id: testCreatedContentTypeCustomVerb,
                label: "updatedlabel custom verb",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        type: "textbox",
                        required: true,
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    label: "Test Field Label",
                    type: "textbox",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };

            request(url)
                .post('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .set('X-HTTP-Method-Override', 'PUT')
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    done();
                });
        });

        it('should return error if content type is updated without a set "ID"', function(done){
            var newContentType = {
                label: "updatedlabel",
                fields: [
                    {
                        id: "testid",
                        label: "Test Field Label",
                        type: "textbox",
                        required: true,
                        instancing: 1
                    }
                ],
                helpText: "",
                meta: [{
                    id: "testmetaid",
                    label: "Test Field Label",
                    type: "textbox",
                    required: true,
                    instancing: 1
                }],
                description: ""
            };

            request(url)
                .put('/contentTypes')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .send(newContentType)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(500);
                    res.body.should.have.property('message');
                    res.body.message.should.have.length.above(0);
                    done();
                });
        });

    });

    describe("DELETE: " + url + '/contentTypes', function() {
        it('should return a 403 because user does not have permissions to access content types', function(done) {
            request(url)
                .del('/contentTypes/' + testCreatedContentTypeId)
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + readerToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(403);
                    done();
                });
        });
        it('should delete a content type using the correct verb', function(done) {
            request(url)
                .del('/contentTypes/' + testCreatedContentTypeId)
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    done();
                });
        });
        it('should delete a content type using the method override', function(done) {
            request(url)
                .post('/contentTypes/' + testCreatedContentTypeCustomVerb)
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('X-HTTP-Method-Override', 'DELETE')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    done();
                });
        });

        it('should return 200 when we try to delete a content type that doesn\'t exist', function(done) {
            request(url)
                .del('/contentTypes/IDONTEXIST')
                .set('Accept', 'application/json')
                .set('Accept-Language', 'en_US')
                .set('authorization', 'Token ' + adminToken)
                .end(function(err, res) {
                    if (err) { throw err; }
                    res.status.should.equal(200);
                    done();
                });
        });
    });
});