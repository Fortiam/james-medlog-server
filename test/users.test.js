
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
      expect(true).to.be.true;
    });
  
    it('2 + 2 should equal 4', () => {
      expect(2 + 2).to.equal(4);
    });
  
});

describe('MedLog API - Users Routes', function () {
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

        it('Should create a new user', function () {
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
              expect(res.body.id).to.exist;
              expect(res.body.username).to.equal(username);
              
              return User.findOne({ username });
            })
            .then(user => {
              expect(user).to.exist;
              expect(user.id).to.equal(res.body.id);
             
              return user.validatePassword(password);
            })
            .then(isValid => {
              expect(isValid).to.be.true;
            });
        });
    });
});
