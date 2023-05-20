const assert = require('assert');
const mealDatabase = require('../util/inmemdb_user');
const pool = require('../util/mysql-db');

let controller = {
  validateMeal: (req, res, next) => {
    let { name, description, price, dateTime, maxAmountOfParticipants } = req.body;
    try {
      assert(typeof name === 'string', 'Name must be a string');
      assert(typeof description === 'string', 'Description must be a string');
      assert(typeof price == 'number', 'Price must be a number');
      //assert(typeof dateTime == 'string', 'DateTime must be a date with time');
      assert(typeof maxAmountOfParticipants == 'number', 'MaxAmountOfParticipants must be a number');
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
        data: []
      }
      next(error);
    }
  },

  // UC-301
  addMeal: (req, res, next) => {
    const cookId = req.userId;
    const meal = req.body;

    const query = {
      sql: 'INSERT INTO `meal` (`isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cook`, `name`, `description`, `allergenes`, `participants`) ' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      values: [meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, cookId, meal.name, meal.description, meal.allergenes, meal.participants]
    }

    pool.getConnection(function(err, connection) {
      if (err) {
        next({
          status: 500,
          message: err.code
        });
      }

      if (connection) {
        connection.query(query, function(error, results, fields) {
          connection.release();
          if (error) throw error;
          res.status(201).json({
            status: 201,
            message: "Meal successfully added",
            data: {
              id: results.insertId,

            }
          });
        });
      }
    });
  },

  // UC-302
  editMealById: (req, res, next) => {

  },

  // UC-303
  getAll: (req, res, next) => {
    const query = 'SELECT * FROM `meal`'

    pool.getConnection(function(err, connection) {
      if (err) {
        next({
          status: 500,
          message: err.code
        });
      }
      if (connection) {
        connection.query(query, function(error, results, fields) {
          connection.release();
          if (error) throw error;
          res.status(200).json({
            status: 200,
            message: "All meals retrieved",
            data: results
          });
        });
      }
    });
  },

  // UC-304
  getMealById: (req, res, next) => {

  },

  // UC-305
  deleteMealById: (req, res, next) => {

  }
}

module.exports = controller