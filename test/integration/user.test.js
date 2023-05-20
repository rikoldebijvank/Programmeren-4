process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal_testdb';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const dbconnection = require('../../src/util/mysql-db');
const jwt = require('jsonwebtoken');
const logger = require('../../src/util/utils').logger;
chai.should();
chai.use(chaiHttp);

// Queries om de database leeg te maken / te vullen
const CLEAR_USER_TABLE = 'DELETE IGNORE FROM user;';
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM meal;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM meal_participants_user;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_USER_TABLE + CLEAR_PARTICIPANTS_TABLE;

const INSERT_USERS =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAddress`, `password`, `street`, `city`, `phoneNumber` ) VALUES' +
  '(1, "firstName1", "lastName1", 0, "a.name@domain.nl", "Password1", "street1", "city1", "0612345678"),' +
  '(2, "firstName2", "lastName2", 1, "b.name@domain.nl", "Password2", "street2", "city2", "0623456789");';

describe('Manage users', () => {
  describe('UC-201 Create new user', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS, function(error, results, fields) {
            connection.release();
            if (error) {
              done(error);
              throw error;
            }
            logger.trace('beforeEach done');
            done();
          }
        );
      });
    });

    it('TC-201-1 Required input is missing when registering a user', (done) => {
      chai.request(server).post('/api/user').send({
        // firstName is missing
        lastName: 'lastNameTest1',
        street: 'testStreet1',
        city: 'testCity1',
        emailAddress: 'a.test@gmail.com',
        password: 'testPassword1',
        phoneNumber: '0612345678'
      }).end((err, res) => {
        let { status, message, data } = res.body;
        status.should.be.equal(400);
        message.should.be.a('string').that.equals('firstName must be a string');
        done();
      });
    });

    it('TC-201-2 EmailAddress is not valid when registering user', (done) => {
      chai.request(server).post('/api/user').send({
        firstName: 'firstNameTest2',
        lastName: 'lastNameTest2',
        street: 'testStreet2',
        city: 'testCity2',
        emailAddress: 'test@gmail.com',
        password: 'testPassword2',
        phoneNumber: '0612345678'
      }).end((err, res) => {
        let { status, message } = res.body;
        status.should.be.equal(400);
        message.should.be.a('string').that.equals('test@gmail.com is not valid');
        done();
      });
    });

    it('TC-201-3 Password is not valid when registering user', (done) => {
      chai.request(server).post('/api/user').send({
        firstName: 'firstNameTest3',
        lastName: 'lastNameTest3',
        street: 'testStreet3',
        city: 'testCity3',
        emailAddress: 'c.test@gmail.com',
        password: 'invalidpassword',
        phoneNumber: '0612345678'
      }).end((err, res) => {
        let { status, message } = res.body;
        status.should.be.equal(400);
        message.should.be.a('string').that.equals('invalidpassword does not fit the criteria');
        done();
      });
    });

    it('PhoneNumber is not valid when registering user', (done) => {
      chai.request(server).post('/api/user').send({
        firstName: 'firstNameTest4',
        lastName: 'lastNameTest4',
        street: 'testStreet4',
        city: 'testCity4',
        emailAddress: 'd.test@gmail.com',
        password: 'testPassword4',
        phoneNumber: '0612345678a'
      }).end((err, res) => {
        let { status, message } = res.body;
        status.should.be.equal(400);
        message.should.be.a('string').that.equals('0612345678a does not fit the criteria');
        done();
      });
    });

    it('TC-201-4 User already exists', (done) => {
      chai.request(server).post('/api/user').send({
        firstName: 'firstName1',
        lastName: 'lastName1',
        street: 'street1',
        city: 'city1',
        emailAddress: 'a.name@domain.nl',
        password: 'Password1',
        phoneNumber: '0612345678'
      }).end((err, res) => {
        let { status, message } = res.body;
        status.should.be.equal(403);
        message.should.be.a('string').that.equals('User already exists');
        done();
      });
    });

    it('TC-201-5 registering user successful', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          id: 7,
          firstName: 'firstNameTest',
          lastName: 'lastNameTest',
          street: 'testStreet',
          city: 'testCity',
          emailAddress: 'e.test@gmail.com',
          password: 'testPassword25',
          phoneNumber: '0612345678'
        })
        .end((err, res) => {
          checkConditions(res, 201);
          let { data } = res.body;
          data.should.be.an('object');
          data.should.has.property('id').to.be.equal(7);
          data.should.has.property('firstName').to.be.equal('firstNameTest');
          data.should.has.property('lastName').to.be.equal('lastNameTest');
          data.should.has.property('street').to.be.equal('testStreet');
          data.should.has.property('city').to.be.equal('testCity');
          data.should.has.property('emailAddress').to.be.equal('e.test@gmail.com');
          data.should.has.property('password').to.be.equal('testPassword25');
          data.should.has.property('phoneNumber').to.be.equal('0612345678');
          done();
        });
    });
  });

  describe('UC-202 retrieve list of users', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS, function(error, results, fields) {
            connection.release();
            if (error) {
              done(error);
              throw error;
            }
            logger.trace('beforeEach done');
            done();
          }
        );
      });
    });

    it('TC-202-1 get all users successful', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey' ))
        .end((err, res) => {
          checkConditions(res, 200);
          let { message, data } = res.body;
          message.should.be.a('string').that.equals('Server get users endpoint');
          data.should.be.an('array');
          data[0].should.has.property('id').to.be.equal(1);
          data[0].should.has.property('firstName').to.be.equal('firstName1');
          data[0].should.has.property('lastName').to.be.equal('lastName1');
          data[0].should.has.property('street').to.be.equal('street1');
          data[0].should.has.property('city').to.be.equal('city1');
          data[0].should.has.property('emailAddress').to.be.equal('a.name@domain.nl');
          data[0].should.has.property('password').to.be.equal('Password1');
          data[0].should.has.property('phoneNumber').to.be.equal('0612345678');

          data[1].should.has.property('id').to.be.equal(2);
          data[1].should.has.property('firstName').to.be.equal('firstName2');
          data[1].should.has.property('lastName').to.be.equal('lastName2');
          data[1].should.has.property('street').to.be.equal('street2');
          data[1].should.has.property('city').to.be.equal('city2');
          data[1].should.has.property('emailAddress').to.be.equal('b.name@domain.nl');
          data[1].should.has.property('password').to.be.equal('Password2');
          data[1].should.has.property('phoneNumber').to.be.equal('0623456789');
          done();
        });
    });

    it.skip('TC-202-2 get all users with incorrect parameters successful', (done) => {
      chai
        .request(server)
        .get('/api/user?test=&anotherTest=')
        .end((err, res) => {
          checkConditions(res, 200);
          let { message, data } = res.body;
          message.should.be.a('string').that.equals('Server get users endpoint');
          data.should.be.an('array');

          done();
        });
    });
  });

  describe('UC-203 retrieve user profile', () => {
    it('TC-203-2 get user profile successful', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey' ))
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.be.equal(200);
          message.should.be.a('string').that.equals('Get profile from user with ID 1 completed');
          done();
        });
    });
  });

  describe('UC-204 retrieve user by id', () => {
    it('TC-204-2 get user by id unsuccessful', (done) => {
      chai
        .request(server)
        .get('/api/user/10')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey' ))
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.be.equal(404);
          message.should.be.equal('User with ID 10 was not found');
          done();
        });
    });

    it('TC-204-3 get user by id successful', (done) => {
      chai
        .request(server)
        .get('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey' ))
        .end((err, res) => {
          checkConditions(res, 200);
          let { message, data } = res.body;
          message.should.be.equal('User with ID 1 was found');
          data.should.be.an('array');
          data[0].should.has.property('id').to.be.equal(1);
          data[0].should.has.property('firstName').to.not.be.empty;
          data[0].should.has.property('lastName').to.not.be.empty;
          data[0].should.has.property('street').to.not.be.empty;
          data[0].should.has.property('city').to.not.be.empty;
          data[0].should.has.property('emailAddress').to.not.be.empty;
          data[0].should.has.property('password').to.not.be.empty;
          data[0].should.has.property('phoneNumber').to.not.be.empty;
          done();
        });
    });
  });

  describe('UC-205 Update user', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS, function(error, results, fields) {
            connection.release();
            if (error) {
              done(error);
              throw error;
            }
            logger.trace('beforeEach done');
            done();
          }
        );
      });
    });

    it('TC-205-1 Email is missing when updating a user', (done) => {
      chai.request(server).put('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey' ))
        .send({
        firstName: 'firstName1',
        lastName: 'lastName1',
        street: 'street1',
        city: 'city1',
        password: 'Password1',
        phoneNumber: '0612345678'
      }).end((err, res) => {
        let { status, message, data } = res.body;
        status.should.be.equal(400);
        message.should.be.a('string').that.equals('emailAddress must be a string');
        done();
      });
    });

    it('TC-205-4 User does not exist', (done) => {
      chai.request(server).put('/api/user/100')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .send({
        firstName: 'firstName1',
        lastName: 'lastName1',
        emailAddress: 'a.test@domain.nl',
        street: 'street1',
        city: 'city1',
        password: 'Password1',
        phoneNumber: '0612345678'
      }).end((err, res) => {
        let { status, message } = res.body;
        status.should.be.equal(404);
        message.should.be.a('string').that.equals('User with ID 100 not found');
        done();
      });
    });
  });

  describe('UC-206 user deleted', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS, function(error, results, fields) {
            connection.release();
            if (error) {
              done(error);
              throw error;
            }
            logger.trace('beforeEach done');
            done();
          }
        );
      });
    });
    it('TC-206-4 delete user successful', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey' ))
        .end((err, res) => {
          res.body.should.be.an('object');
          res.body.should.has.property('status').to.be.equal(200);
          res.body.should.has.property('message').to.be.equal('User with ID 1 was deleted');
          done();
        });
    });
  });

});

const checkConditions = function(res, status) {
  res.body.should.be.an('object');
  res.body.should.has.property('status').to.be.equal(status);
  res.body.should.has.property('message');
  res.body.should.has.property('data');
};
