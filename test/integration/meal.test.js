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

const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`, `allergenes`) VALUES ' +
  '(1,1,0,0,1,"2022-03-22 17:35:00",4,12.75,"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",1,"2022-02-26 18:12:40.048998","2022-04-26 12:33:51.000000","Pasta Bolognese met tomaat, spekjes en kaas","Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!","gluten,lactose"), ' +
  '(2,1,1,0,0,"2022-05-22 13:35:00",4,12.75,"https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg",2,"2022-02-26 18:12:40.048998","2022-04-25 12:56:05.000000","Aubergine uit de oven met feta, muntrijst en tomatensaus","Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.","noten");';

describe('Manage meals', () => {
  describe('UC-301 Create new meal', () => {

    it('TC-301-1 Required field is missing', (done) => {
      chai.request(server).post('/api/meal').send({}).set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secretkey'))
        .end((err, result) => {

        });
    });
  });
});