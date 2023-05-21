const assert = require('assert');
const userDatabase = require('../util/inmemdb_user');
const pool = require('../util/mysql-db');

let controller = {

  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, street, city, emailAddress, password, phoneNumber } = user;
    try {
      assert(typeof firstName === 'string', 'firstName must be a string');
      assert(typeof lastName === 'string', 'lastName must be a string');
      assert(typeof street === 'string', 'street must be a string');
      assert(typeof city === 'string', 'city must be a string');
      assert(typeof emailAddress === 'string', 'emailAddress must be a string');
      emailValidation(emailAddress);
      assert(typeof password === 'string', 'password must be a string');
      passwordValidation(password);
      assert(typeof phoneNumber === 'string', 'phoneNumber must be a string');
      phoneNumberValidation(phoneNumber);
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

  // UC-201
  addUser: (req, res, next) => {
    // userDatabase.add(req.body, (error, result) => {
    //   if (error) {
    //     console.log(`index.js : ${error}`);
    //     res.status(401).json({
    //       status: 401,
    //       message: error
    //     });
    //   }
    //   if (result) {
    //     console.log(`index.js : User successfully added`);
    //     res.status(201).json({
    //       status: 201,
    //       message: 'Server register user endpoint',
    //       data: result
    //     });
    //   }

    const user = req.body;
    const query = {
      sql: 'INSERT INTO `user` (`firstName`, `lastName`, `isActive`, `emailAddress`, `password`, `street`, `city`, `phoneNumber`) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      values: [user.firstName, user.lastName, user.isActive || 0, user.emailAddress, user.password, user.street, user.city, user.phoneNumber]
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
          if (error) {
            if (error.sqlMessage.includes('Duplicate')) {
              res.status(403).json({
                status: 403,
                message: 'User already exists',
                data: []
              });
              return;
            } else throw error;
          }
          res.status(201).json({
            status: 201,
            message: 'User successfully registered',
            data: {
              id: results.insertId,
              ...user
            }
          });
        });
      }
    });
  },

  // UC-202
  getUserByIdWithQuery: (req, res, next) => {
    const queryField = Object.entries(req.query);
    const validQueries = ['firstName', 'lastName', 'street', 'city', 'isActive', 'emailAddress', 'password', 'phoneNumber'];
    let query = '';
    let message = '';

    if (queryField.length === 0) {
      query = 'SELECT * FROM user';
      message = 'Server get users endpoint';
    } else if (queryField.length >= 2 && (!validQueries.includes(queryField[0][0]) || !validQueries.includes(queryField[1][0]))) {
      query = 'SELECT * from `user` WHERE 1=0';
      message = 'Invalid query parameters';
    } else if (queryField.length === 2 && (validQueries.includes(queryField[0][0]) && validQueries.includes(queryField[1][0]))) {
      query = 'SELECT * FROM `user` WHERE ' + queryField[0][0] + ' = \'' + queryField[0][1] + '\' AND ' + queryField[1][0] + ' = \'' + queryField[1][1] + '\';';
      message = `Get user filtered by ${queryField[0][0]} and ${queryField[1][0]}`;
    } else if (queryField.length === 1 && validQueries.includes(queryField[0][0])) {
      query = 'SELECT * FROM `user` WHERE ' + queryField[0][0] + ' = \'' + queryField[0][1] + '\';';
      message = `Get user filtered by ${queryField[0][0]}`;
    } else {
      query = 'SELECT * from `user` WHERE 1=0';
      message = 'Invalid query parameters';
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
          res.status(200).json({
            status: 200,
            message: message,
            data: results
          });
        });
      }
    });
  },

  // UC-203
  getUserProfile: (req, res) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        next({
          status: 500,
          message: err.code
        });
      }

      connection.query('SELECT * FROM user WHERE id = ' + req.userId, function(error, results, fields) {
        connection.release();
        if (error) throw error;
        if (results.length === 0) {
          res.status(404).json({
            status: 404,
            message: `User with ID ${req.userId} was not found`,
            data: []
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Profile found`,
            data: results
          });
        }
      });
    });
  },

  // UC-204
  getUserById: (req, res, next) => {
    const userId = req.params.id;
    // userDatabase.getById(id, (error, result) => {
    //   if (error) {
    //     res.status(400).json({
    //       status: 400,
    //       message: error
    //     });
    //   }
    //   if (result) {
    //     res.status(200).json({
    //       status: 200,
    //       message: `User with ID ${id} was found`,
    //       data: result
    //     });
    //   }
    // });

    pool.getConnection(function(err, connection) {
      if (err) {
        next({
          status: 500,
          message: err.code
        });
      }

      connection.query('SELECT * FROM user WHERE id = ' + userId, function(error, results, fields) {
        connection.release();
        if (error) throw error;
        if (results.length === 0) {
          res.status(404).json({
            status: 404,
            message: `User with ID ${userId} was not found`,
            data: []
          });
        } else {
          if (userId != req.userId) {
            let { password, ...info } = results[0];
            res.status(200).json({
              status: 200,
              message: `User with ID ${userId} was found`,
              data: info
            });
          } else {
            res.status(200).json({
              status: 200,
              message: `User with ID ${userId} was found`,
              data: results
            });
          }
        }
      });
    });
  },

  // UC-205
  editUserById: (req, res, next) => {
    const userId = parseInt(req.params.id);
    const user = req.body;
    const query = {
      sql: 'UPDATE `user` SET firstName=?, lastName=?, emailAddress=?, street=?, city=?, password=?, phoneNumber=? WHERE id=' + userId + ';',
      values: [user.firstName, user.lastName, user.emailAddress, user.street, user.city, user.password, user.phoneNumber],
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
          console.log(results.affectedRows)
          if (results.affectedRows === 0) {
            res.status(404).json({
              status: 404,
              message: `User with ID ${userId} not found`,
              data: []
            });
            return;
          }
          if (userId === req.userId) {
            res.status(200).json({
              status: 200,
              message: `User with ID ${userId} edited`,
              data: {
                id: req.userId,
                ...user
              }
            });
          } else {
            res.status(403).json({
              status: 403,
              message: 'Not authorized',
              data: []
            });
          }
        });
      }
    });

    // userDatabase.editById(id, req.body, (error, result) => {
    //   if (error) {
    //     res.status(404).json({
    //       error
    //     });
    //   } else {
    //     res.status(200).json({
    //       status: 200,
    //       message: 'Server edit user endpoint',
    //       data: result
    //     });
    //   }
    // });
  },

  // UC-206
  deleteUserById: (req, res, next) => {
    const userId = parseInt(req.params.id);
    // userDatabase.deleteById(id, (error, result) => {
    //   if (error) {
    //     res.status(404).json({
    //       error
    //     })
    //   } else {
    //     res.status(200).json({
    //       status: 200,
    //       message: `Server- User with ID: ${id} removed`
    //     })
    //   }
    // })

    if (userId === req.userId) {
      pool.getConnection(function(err, connection) {
        if (err) {
          next({
            status: 500,
            message: err.code
          });
        }
        let cookId = null;
        let query = 'DELETE FROM `user` WHERE id = ' + userId;
        connection.query('SELECT cookId FROM `meal` WHERE cookId = ' + userId, function(error, results, field) {
          if (error) throw error;
          try {
            cookId = results[0].cookId;
            query = 'UPDATE `meal` SET cookId = NULL WHERE cookId =' + userId + '; DELETE FROM `user` WHERE id = ' + userId;
            connection.query(query, function(error, results, fields) {
              connection.release();
              if (error) throw error;
              res.status(200).json({
                status: 200,
                message: `User with ID ${userId} was deleted`,
                data: []
              });
            });
          } catch {
            query = 'DELETE FROM `user` WHERE id = ' + userId;
            connection.query(query, function(error, results, fields) {
              connection.release();
              if (error) throw error;
              res.status(200).json({
                status: 200,
                message: `User with ID ${userId} was deleted`,
                data: []
              });
            });
          }
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
};

function emailValidation(emailAddress) {
  const regex = /^[a-zA-Z]{1,1}\.[a-zA-Z]{1,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/gm;
  const checkEmail = emailAddress.match(regex);
  if (checkEmail == null) {
    throw new Error(`${emailAddress} is not valid`);
  }
}

function passwordValidation(password) {
  const regex = /(?=[A-Za-z0-9=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$/gm;
  const checkPassword = password.match(regex);
  if (checkPassword == null) {
    throw new Error(`${password} does not fit the criteria`);
  }
}

function phoneNumberValidation(phoneNumber) {
  const regex = /^06( )?(-)?[0-9]{8}$/gm;
  const checkPhoneNumber = phoneNumber.match(regex);
  if (checkPhoneNumber == null) {
    throw new Error(`${phoneNumber} does not fit the criteria`);
  }
}

module.exports = controller;