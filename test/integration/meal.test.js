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

const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`, `allergenes`) VALUES ' +
  '(1,1,0,0,1,"2022-03-22 17:35:00",4,12.75,"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",1,"Pasta Bolognese met tomaat, spekjes en kaas","Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!","gluten,lactose"), ' +
  '(2,1,1,0,0,"2022-05-22 13:35:00",4,12.75,"https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg",2,"Aubergine uit de oven met feta, muntrijst en tomatensaus","Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.","noten");';

describe('Manage meals', () => {
  describe('UC-301 Create new meal', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS + INSERT_MEALS, function(error, results, fields) {
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

    it('TC-301-1 Required field is missing', (done) => {
      chai.request(server).post('/api/meal').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        // Name is missing
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 400);
          let { message } = res.body;
          message.should.be.equal('Name must be a string');
          done();
        });
    });

    it('TC-301-2 Not logged in', (done) => {
      chai.request(server).post('/api/meal').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        'name': 'Spaghetti',
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).end((err, res) => {
        checkConditions(res, 401);
        let { message } = res.body;
        message.should.be.equal('Authorization header missing');
        done();
      });
    });

    it('TC-301-3 Meal successfully added', (done) => {
      chai.request(server).post('/api/meal').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        'name': 'Spaghetti',
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 201);
          let { message, data } = res.body;
          message.should.be.equal('Meal successfully added');
          data.should.be.an('object');
          data.should.has.property('id');
          data.should.has.property('isVega').to.be.equal(1);
          data.should.has.property('isToTakeHome').to.be.equal(1);
          data.should.has.property('dateTime').to.be.equal('2023-05-22 17:35:00');
          data.should.has.property('maxAmountOfParticipants').to.be.equal(3);
          data.should.has.property('price').to.be.equal(9);
          data.should.has.property('imageUrl').to.be.equal('url');
          data.should.has.property('cookId').to.be.equal(1);
          data.should.has.property('name').to.be.equal('Spaghetti');
          data.should.has.property('description').to.be.equal('Beste Spaghetti');
          data.should.has.property('allergenes').to.be.equal('gluten');
          done();
        });
    });
  });

  describe('UC-302 Update meal info', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS + INSERT_MEALS, function(error, results, fields) {
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

    it('TC-302-1 Required field is missing', (done) => {
      chai.request(server).put('/api/meal/1').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        // Name is missing
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 400);
          let { message } = res.body;
          message.should.be.equal('Name must be a string');
          done();
        });
    });

    it('TC-301-2 Not logged in', (done) => {
      chai.request(server).put('/api/meal/1').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        'name': 'Spaghetti',
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).end((err, res) => {
        checkConditions(res, 401);
        let { message } = res.body;
        message.should.be.equal('Authorization header missing');
        done();
      });
    });

    it('TC-302-3 Not the owner', (done) => {
      chai.request(server).put('/api/meal/2').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        'name': 'Spaghetti',
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 403);
          let { message } = res.body;
          message.should.be.equal('Not authorized');
          done();
        });
    });

    it('TC-302-4 Meal does not exist', (done) => {
      chai.request(server).put('/api/meal/10').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        'name': 'Spaghetti',
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 404);
          let { message } = res.body;
          message.should.be.equal('Meal with ID 10 was not found');
          done();
        });
    });

    it('TC-301-5 Meal successfully edited', (done) => {
      chai.request(server).put('/api/meal/1').send({
        'isVega': 1,
        'isVegan': 0,
        'isToTakeHome': 1,
        'dateTime': '2023-05-22 17:35:00',
        'maxAmountOfParticipants': 3,
        'price': 9,
        'imageUrl': 'url',
        'cookId': 1,
        'name': 'Spaghetti (edit)',
        'description': 'Beste Spaghetti',
        'allergenes': 'gluten'
      }).set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 201);
          let { message, data } = res.body;
          message.should.be.equal('Meal with ID 1 successfully updated');
          data.should.be.an('object');
          data.should.has.property('id');
          data.should.has.property('isVega').to.be.equal(1);
          data.should.has.property('isToTakeHome').to.be.equal(1);
          data.should.has.property('dateTime').to.be.equal('2023-05-22 17:35:00');
          data.should.has.property('maxAmountOfParticipants').to.be.equal(3);
          data.should.has.property('price').to.be.equal(9);
          data.should.has.property('imageUrl').to.be.equal('url');
          data.should.has.property('cookId').to.be.equal(1);
          data.should.has.property('name').to.be.equal('Spaghetti (edit)');
          data.should.has.property('description').to.be.equal('Beste Spaghetti');
          data.should.has.property('allergenes').to.be.equal('gluten');
          done();
        });
    });
  });

  describe('UC-303 Retrieve list of meals', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS + INSERT_MEALS, function(error, results, fields) {
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

    it('TC-303-1 Meals successfully retrieved', (done) => {
      chai.request(server).get('/api/meal').set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 200);
          let { message, data } = res.body;
          message.should.be.equal('All meals retrieved');
          data.should.be.an('array');
          data[0].should.has.property('id');
          data[0].should.has.property('isVega').to.be.equal(0);
          data[0].should.has.property('isVegan').to.be.equal(0);
          data[0].should.has.property('isToTakeHome').to.be.equal(1);
          data[0].should.has.property('dateTime');
          data[0].should.has.property('maxAmountOfParticipants').to.be.equal(4);
          data[0].should.has.property('price').to.be.equal('12.75');
          data[0].should.has.property('imageUrl').to.be.equal('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg');
          data[0].should.has.property('cook').should.be.an('object');
          data[0].should.has.property('name').to.be.equal('Pasta Bolognese met tomaat, spekjes en kaas');
          data[0].should.has.property('description').to.be.equal('Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!');
          data[0].should.has.property('allergenes').to.be.equal('gluten,lactose');
          done();
        });
    });
  });

  describe('UC-304 Get meal by ID', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS + INSERT_MEALS, function(error, results, fields) {
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

    it('TC-304-1 Meal does not exist', (done) => {
      chai.request(server).get('/api/meal/10').set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 404);
          let { message } = res.body;
          message.should.be.equal('Meal with ID 10 was not found');
          done();
        });
    });

    it('TC-304-2 Meal data retrieved', (done) => {
      chai.request(server).get('/api/meal/1').set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 200);
          let { message, data } = res.body;
          message.should.be.equal('Meal with ID 1 found, you are the owner');
          data.should.be.an('array');
          data[0].should.has.property('id');
          data[0].should.has.property('isVega').to.be.equal(0);
          data[0].should.has.property('isVegan').to.be.equal(0);
          data[0].should.has.property('isToTakeHome').to.be.equal(1);
          data[0].should.has.property('dateTime');
          data[0].should.has.property('maxAmountOfParticipants').to.be.equal(4);
          data[0].should.has.property('price').to.be.equal('12.75');
          data[0].should.has.property('imageUrl').to.be.equal('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg');
          data[0].should.has.property('cook').should.be.an('object');
          data[0].should.has.property('name').to.be.equal('Pasta Bolognese met tomaat, spekjes en kaas');
          data[0].should.has.property('description').to.be.equal('Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!');
          data[0].should.has.property('allergenes').to.be.equal('gluten,lactose');
          done();
        });
    });
  });

  describe('UC-305 Deleting a meal', () => {
    beforeEach((done) => {
      logger.trace('beforeEach called');
      dbconnection.getConnection(function(err, connection) {
        if (err) {
          done(err);
          throw err;
        }

        connection.query(CLEAR_DB + INSERT_USERS + INSERT_MEALS, function(error, results, fields) {
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

    it('TC-305-1 Not logged in', (done) => {
      chai.request(server).delete('/api/meal/1').end((err, res) => {
        checkConditions(res, 401);
        let { message } = res.body;
        message.should.be.equal('Authorization header missing');
        done();
      });
    });

    it('TC-305-2 Not the owner', (done) => {
      chai.request(server).delete('/api/meal/2').set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 403);
          let { message } = res.body;
          message.should.be.equal('Not authorized');
          done();
        });
    });

    it('TC-305-3 Meal does not exist', (done) => {
      chai.request(server).delete('/api/meal/10').set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 404);
          let { message } = res.body;
          message.should.be.equal('Meal with ID 10 was not found');
          done();
        });
    });

    it('TC-305-4 Meal successfully deleted', (done) => {
      chai.request(server).delete('/api/meal/1').set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, res) => {
          checkConditions(res, 200);
          let { message, data } = res.body;
          message.should.be.equal('Maaltijd met ID 1 is verwijderd');
          data.should.be.an('array');
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