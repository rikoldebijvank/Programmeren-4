const assert = require('assert');
const mealDatabase = require('../util/inmemdb_user');
const pool = require('../util/mysql-db');

let controller = {
  validateMealWhenAdded: (req, res, next) => {
    let { name, description, price, dateTime, maxAmountOfParticipants } = req.body;
    try {
      assert(typeof name === 'string', 'Name must be a string');
      assert(typeof description === 'string', 'Description must be a string');
      assert(typeof price == 'number', 'Price must be a number');
      //assert(typeof dateTime == 'string', 'DateTime must be a date with time');
      assert(typeof maxAmountOfParticipants == 'number', 'MaxAmountOfParticipants must be a number');
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
        data: []
      };
      next(error);
    }
  },

  validateMealWhenUpdated: (req, res, next) => {
    let { name, description, price, dateTime, maxAmountOfParticipants } = req.body;
    try {
      assert(typeof name === 'string', 'Name must be a string');
      assert(typeof price == 'number', 'Price must be a number');
      assert(typeof maxAmountOfParticipants == 'number', 'MaxAmountOfParticipants must be a number');
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
        data: []
      };
      next(error);
    }
  },

  // UC-301
  addMeal: (req, res, next) => {
    const cookId = req.userId;
    let meal = req.body;
    meal = {
      isVega: meal.isVega || 0,
      isVegan: meal.isVegan || 0,
      isToTakeHome: meal.isToTakeHome || 0,
      dateTime: meal.dateTime,
      maxAmountOfParticipants: meal.maxAmountOfParticipants,
      price: meal.price,
      imageUrl: meal.imageUrl || '',
      cookId,
      name: meal.name,
      description: meal.description,
      allergenes: meal.allergenes || ''
    };
    const query = {
      sql: 'INSERT INTO `meal` (`isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`, `allergenes`) ' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      values: [meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, cookId, meal.name, meal.description, meal.allergenes || ['']],
      timeout: 2000
    };

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
            message: 'Meal successfully added',
            data: {
              id: results.insertId,
              ...meal
            }
          });
        });
      }
    });
  },

  // UC-302
  editMealById: (req, res, next) => {
    const mealId = parseInt(req.params.id);
    const meal = req.body;
    const query = {
      sql: 'UPDATE `meal` SET name=?, price=?, maxAmountOfParticipants=?',
      values: [meal.name, meal.price, meal.maxAmountOfParticipants]
    };

    query.sql += ' WHERE id=' + mealId;

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
            message: `Meal with ID ${mealId} successfully updated`,
            data: {
              id: mealId,
              ...meal
            }
          });
        });
      }
    });
  },

  // UC-303
  getAll: (req, res, next) => {
    const query = 'SELECT * FROM `meal`';

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
            message: 'All meals retrieved',
            data: results
          });
        });
      }
    });
  },

  // UC-304
  getMealById: (req, res, next) => {
    const mealId = parseInt(req.params.id);
    const query = 'SELECT * FROM `meal` WHERE id=' + mealId;

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
          if (results.length === 0) {
            res.status(404).json({
              status: 404,
              message: `Meal with ID ${mealId} was not found`,
              data: []
            });
          } else {
            res.status(200).json({
              status: 200,
              message: `Meal with ID ${mealId} found`,
              data: results
            });
          }
        });
      }
    });
  },

  // UC-305
  deleteMealById: (req, res, next) => {
    const mealId = parseInt(req.params.id);
    const cookIdQuery = {
      sql: 'SELECT cookId FROM `meal` WHERE id=?',
      values: [mealId]
    };
    const query = 'DELETE FROM `meal` WHERE id=' + mealId;

    pool.getConnection(function(err, connection) {
      if (err) {
        next({
          status: 500,
          message: err.code
        });
      }
      if (connection) {
        connection.query(cookIdQuery, function(error, results, fields) {
          connection.release();
          if (error) throw error;
          if (results.length === 0) {
            res.status(404).json({
              status: 404,
              message: `Meal with ID ${mealId} was not found`,
              data: []
            });
          } else {
            const userId = results[0].cookId;
            if (userId === req.userId) {
              connection.query(query, function(error, results, fields) {
                connection.release();
                if (error) throw error;
                res.status(200).json({
                  status: 200,
                  message: `Maaltijd met ID ${mealId} is verwijderd`,
                  data: []
                });
              });
            } else {
              res.status(403).json({
                status: 403,
                message: 'Not authorized',
                data: []
              });
            }
          }
        });
      }
    });
  }
};

module.exports = controller;