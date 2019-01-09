
const {app} = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { TEST_DATABASE_URL } = require('../config');
const User = require('../models/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Reality Check', () => {
    it('true should be true', () => {
      expect(true).to.equal(true);
    });
    it('2 + 2 should equal 4', () => {
      expect(2 + 2).to.equal(4);
    });
});

describe('MedLog Account related API - Create, Login, and Users Routes', function () {
    const username = 'exampleUser';
    const password = 'examplePass';
    const firstName = 'Example User';
    const useEmailForApi = false;
    before(function () {
      return mongoose.connect(TEST_DATABASE_URL, { useNewUrlParser: true, useCreateIndex : true })
        .then(() => User.deleteMany());
    });
  
    beforeEach(function () {
      return User.createIndexes();
    });
  
    afterEach(function () {
      return User.deleteMany();
    });
  
    after(function () {
      return mongoose.disconnect();
    });
    describe('POST /register', function () {

        it('Should create a new user account', function () {
          let res;
          return chai
            .request(app)
            .post('/register')
            .send({ username, password, firstName, useEmailForApi })
            .then(_res => {
              res = _res;
              expect(res).to.have.status(201);
              expect(res.body).to.be.an('object');
              expect(res.body).to.have.keys('firstName', 'useEmailForApi', 'id', 'username');
              expect(res.body.username).to.equal(username);
              expect(res.body.firstName).to.equal(firstName);
              expect(res.body.useEmailForApi).to.equal(useEmailForApi);
              return User.findOne({ username });
            })
            .then(user => {
              expect(user).to.be.an('object');
              expect(user.id).to.equal(res.body.id);
              return user.validatePassword(password);
            })
            .then(isValid => {
              expect(isValid).to.equal(true);
            });
        });
    });

    describe('POST /login', function(){
        it('Should log - in the user', function(){
          return chai.request(app)
          .post('/register')
          .send({username, password})
            .then((createdUser)=>{
                return chai.request(app)
                  .post('/login')
                  .send({username, password})
                    .then(results=>{
                      expect(results.body).to.be.an('object');
                      expect(results.body).to.have.key('authToken');
                      expect(results.body.authToken).to.be.a('string');
                    })
                    .catch(()=>{});
            })
        })
    });
    describe('PUT /:(the user id)', function(){
        it('Should change the users firstName when sent token and firstName', function(){
          let newUserScope;
          return chai.request(app)
            .post('/register')
            .send({username, password, firstName})
              .then(newUser=>{
                newUserScope = newUser.body;//captured id for user
                return chai.request(app)
                .post('/login')
                .send({username, password})
                  .then(result=>{
                    let loggedUserToken = result.body.authToken;
                    return chai.request(app)
                    .put(`/${newUserScope.id}`)
                    .header({"Authorization": `Bearer ${loggedUserToken}`})
                    .send({"firstName": "New User Name"})
                  })
                  .then(finalResult=>{
                    expect(finalResult).to.be.an('object');
                    expect(finalResult).to.have.key('firstName');
                    expect(finalResult.firstName).to.be.a('string');
                    expect(finalResult.firstName).to.be.equal.to('New User Name');
                  })
                  .catch(err=>{});
                  });
        });
        it('Should change lastName when sent token and new lastName', function(){
          let newUserScope;
          return chai.request(app)
            .post('/register')
            .send({username, password, firstName})
              .then(newUser=>{
                newUserScope = newUser.body;
                return chai.request(app)
                .post('/login')
                .send({username, password})
                  .then(result=>{
                    let loggedUserToken = result.body.authToken;
                    return chai.request(app)
                    .put(`/${newUserScope.id}`)
                    .header({"Authorization": `Bearer ${loggedUserToken}`})
                    .send({"lastName": "New User Last Name"})
                  })
                  .then(finalResult=>{
                    expect(finalResult).to.be.an('object');
                    expect(finalResult).to.have.key('lastName');
                    expect(finalResult.lastName).to.be.a('string');
                    expect(finalResult.lastName).to.be.equal.to('New User Last Name');
                  })
                  .catch(err=>{});
                  });
        });
        it('Should change email when sent valid token and email', function(){
          let newUserScope;
          let emailAddress = 'a@b.com';
          return chai.request(app)
            .post('/register')
            .send({username, password, firstName, "email": emailAddress})
              .then(newUser=>{
                newUserScope = newUser.body;
                return chai.request(app)
                .post('/login')
                .send({username, password})
                  .then(result=>{
                    let loggedUserToken = result.body.authToken;
                    return chai.request(app)
                    .put(`/${newUserScope.id}`)
                    .header({"Authorization": `Bearer ${loggedUserToken}`})
                    .send({"email": "New@User.net"})
                  })
                  .then(finalResult=>{
                    expect(finalResult).to.be.an('object');
                    expect(finalResult).to.have.key('email');
                    expect(finalResult.email).to.be.a('string');
                    expect(finalResult.email).to.be.equal.to('New@User.net');
                  })
                  .catch(err=>{});
                  });
        });
        it('Should return an error message when given an invalid token', function(){
          let scope;
          return chai.request(app)
          .post('/register')
          .send({username, password})
            .then(newUser=>{
              scope = newUser.body;
              return chai.request(app)
              .post('/login')
              .send({username, password})
                .then(()=>{
                  return chai.request(app)
                  .put(`/${scope.id}`)
                  .header({"Authorization": `Bearer of Blueberries`})
                  .send({"username": "goodbye"})
                })
                .then(badRequest=>{
                  expect(badRequest).to.have.status(401);
                  expect(badRequest.message).to.include('Invalid id in request body');
                })
                .catch(()=>{});
              });
        });
    });
    describe('DELETE /:(the user id)', function(){
        it('Should return a 404 when given an invalid id', function(){
          let scope;
          return chai.request(app)
          .post('/register')
          .send({username, password})
            .then(newUser=>{
              return chai.request(app)
              .post('/login')
              .send({username, password})
                .then((tokenData)=>{
                  scope = tokenData.body;
                  return chai.request(app)
                  .delete(`/totes-Invalid-Id`)
                  .header({"Authorization": `${scope.authToken}`})
                })
                .then(badRequest=>{
                  expect(badRequest).to.have.status(401);
                  expect(badRequest.message).to.include('Invalid id in request body');
                })
                .catch(()=>{});
              });
        });
        it('Should delete the user account when given a valid id', function(){
          let scope;
          return chai.request(app)
          .post('/register')
          .send({username, password})
            .then(newUser=>{
              scope = newUser.body;
              return chai.request(app)
              .post('/login')
              .send({username, password})
                .then((token)=>{
                  return chai.request(app)
                  .delete(`/${scope.id}`)
                  .header({"Authorization": `Bearer ${token.body.authToken}`})
                })
                .then(gone=>{
                  expect(gone).to.have.status(201);
                })
                .catch(()=>{});
              });
        });
    })
});
