const assert = require('assert');
const mealDatabase = require('../util/inmemdb_user');
const pool = require('../util/mysql-db');

let controller = {
  validateMealWhenAdded: (req, res, next) => {
    let { name, description, price, dateTime, maxAmountOfParticipants, imageUrl } = req.body;
    try {
      assert(typeof name === 'string', 'Name must be a string');
      assert(typeof description === 'string', 'Description must be a string');
      assert(typeof price == 'number', 'Price must be a number');
      //assert(typeof dateTime == 'string', 'DateTime must be a date with time');
      assert(typeof maxAmountOfParticipants == 'number', 'MaxAmountOfParticipants must be a number');
      assert(typeof imageUrl === 'string', 'ImageUrl must be a string');
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
    if (meal.isActive || meal.isActive === 0) {
      query.sql += ', isActive=?';
      query.values.push(meal.isActive);
    }
    if (meal.isVega || meal.isVega === 0) {
      query.sql += ', isVegan=?';
      query.values.push(meal.isVegan);
    }
    if (meal.isVegan || meal.isVegan === 0) {
      query.sql += ', isVegan=?';
      query.values.push(meal.isVegan);
    }
    if (meal.isToTakeHome || meal.isToTakeHome === 0) {
      query.sql += ', isToTakeHome=?';
      query.values.push(meal.isToTakeHome);
    }
    if (meal.dateTime) {
      query.sql += ', dateTime=?';
      query.values.push(meal.dateTime);
    }
    if (meal.imageUrl) {
      query.sql += ', imageUrl=?';
      query.values.push(meal.imageUrl);
    }
    if (meal.description) {
      query.sql += ', description=?';
      query.values.push(meal.description);
    }
    if (meal.allergenes) {
      query.sql += ', allergenes=?';
      query.values.push(meal.allergenes);
    }
    query.sql += ' WHERE id=' + mealId;

    pool.getConnection(function(err, connection) {
      if (err) {
        next({
          status: 500,
          message: err.code
        });
      }
      if (connection) {
        connection.query('SELECT id, cookId FROM `meal` WHERE id=' + mealId, function(error, results, fields) {
          if (error) throw error;
          if (results.length === 0) {
            connection.release();
            res.status(404).json({
              status: 404,
              message: `Meal with ID ${mealId} was not found`,
              data: []
            });
          } else if (results[0].cookId === req.userId) {
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
          } else {
            connection.release();
            res.status(403).json({
              status: 403,
              message: 'Not authorized',
              data: []
            });
          }
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
          if (error) throw error;
          for (let i = 0; i < results.length; i++) {
            let { cookId, ...mealInfo } = results[i];
            if (cookId !== null) {
              connection.query('SELECT * FROM `user` WHERE id=' + cookId, function(error, newResults, fields) {
                connection.release();
                if (error) throw error;
                if (newResults.length === 0) {
                  results[i] = {
                    ...mealInfo,
                    cook: null
                  };
                } else {
                  let { password, ...newResultsInfo } = newResults[0];
                  results[i] = {
                    ...mealInfo,
                    cook: newResultsInfo
                  };
                }
                if (i === results.length - 1) {
                  res.status(200).json({
                    status: 200,
                    message: 'All meals retrieved',
                    data: results
                  });
                }
              });
            }
          }
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
          if (error) throw error;

          if (results.length > 0) {
            let { cookId, ...mealInfo } = results[0];
            connection.query('SELECT * FROM `user` WHERE id=' + cookId, function(error, newResults, fields) {
              connection.release();
              if (error) throw error;
              if (newResults.length === 0) {
                res.status(404).json({
                  status: 404,
                  message: `Meal with ID ${mealId} was not found`,
                  data: []
                });
              } else if (cookId === req.userId) {
                results[0] = {
                  ...mealInfo,
                  cook: newResults[0]
                };
                res.status(200).json({
                  status: 200,
                  message: `Meal with ID ${mealId} found, you are the owner`,
                  data: results
                });
              } else {
                let { password, ...userInfo } = newResults[0];
                results[0] = {
                  ...mealInfo,
                  cook: userInfo
                };
                res.status(200).json({
                  status: 200,
                  message: `Meal with ID ${mealId} found`,
                  data: results
                });
              }
            });
          } else {
            connection.release()
            res.status(404).json({
              status: 404,
              message: `Meal with ID ${mealId} was not found`,
              data: []
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
          if (error) throw error;
          if (results.length === 0) {
            connection.release();
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
              connection.release();
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