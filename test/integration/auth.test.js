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

describe('Manage authentication', () => {
  describe('UC-101 Logging in', () => {
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

    it('TC-101-1 Required field is missing', (done) => {
      chai.request(server).post('/api/login').send({
        'emailAddress': 'a.name@domain.nl'
      }).end((err, res) => {
        checkConditions(res, 400);
        let { message, data } = res.body;
        message.should.be.equal('Password must be a string');
        data.should.be.empty;
        done();
      });
    });

    it('TC-101-2 Incorrect password', (done) => {
      chai.request(server).post('/api/login').send({
        'emailAddress': 'a.name@domain.nl',
        'password': 'incorrect'
      }).end((err, res) => {
        checkConditions(res, 403);
        let { message, data } = res.body;
        message.should.be.equal('Not authorized');
        data.should.be.empty;
        done();
      });
    });

    it('TC-101-3 User does not exist', (done) => {
      chai.request(server).post('/api/login').send({
        'emailAddress': 'a.incorrect@email.nl',
        'password': 'Password1'
      }).end((err, res) => {
        checkConditions(res, 404);
        let { message, data } = res.body;
        data.should.be.empty;
        message.should.be.equal('User with email a.incorrect@email.nl not found');
        done();
      });
    });

    it('TC-101-4 User successfully logged in', (done) => {
      chai.request(server).post('/api/login').send({
        'emailAddress': 'a.name@domain.nl',
        'password': 'Password1'
      }).end((err, res) => {
        checkConditions(res, 200);
        let { message, data } = res.body;
        message.should.be.equal('User with email address a.name@domain.nl successfully logged in');
        data.should.has.property('id').to.be.equal(1);
        data.should.has.property('firstName').to.be.equal('firstName1');
        data.should.has.property('lastName').to.be.equal('lastName1');
        data.should.has.property('emailAddress').to.be.equal('a.name@domain.nl');
        data.should.has.property('token');
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