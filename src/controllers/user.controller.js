const assert = require('assert');
const userDatabase = require('../util/inmemdb_user');
const dbconnection = require('../util/dbconnection');

let controller = {

  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = user;
    try {
      assert(typeof firstName === 'string', 'firstName must be a string');
      assert(typeof lastName === 'string', 'lastName must be a string');
      assert(typeof street === 'string', 'street must be a string');
      assert(typeof city === 'string', 'city must be a string');
      assert(typeof isActive === 'boolean', 'isActive must be a boolean');
      assert(typeof emailAddress === 'string', 'emailAddress must be a string');
      assert(typeof password === 'string', 'password must be a string');
      assert(typeof phoneNumber === 'string', 'phoneNumber must be a string');
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message
      };
      next(error);
    }
  },
  // UC-201
  addUser: (req, res) => {
    userDatabase.add(req.body, (error, result) => {
      if (error) {
        console.log(`index.js : ${error}`);
        res.status(401).json({
          status: 401,
          message: error
        });
      }
      if (result) {
        console.log(`index.js : User successfully added`);
        res.status(201).json({
          status: 201,
          message: 'Server register user endpoint',
          data: result
        });
      }
    });
  },
  // UC-202
  getAllUsers: (req, res) => {
    // userDatabase.getAll((result) => {
    //   res.status(200).json({
    //     status: 200,
    //     message: "Server get users endpoint",
    //     data: result
    //   })
    // })

    dbconnection.getConnection(function(err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM user', function(error, results, fields) {
        connection.release();
        if (error) throw error;
        res.status(200).json({
          status: 200,
          message: 'Server get users endpoint',
          data: results
        });
      });

      dbconnection.end((err) => {
        console.log('Pool is closed');
      });
    });
  },

  // UC-203
  getUserProfile: (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Receive profile data functionality not yet added'
    });
  },

  // UC-204
  getUserById: (req, res) => {
    const id = req.params.id;
    userDatabase.getById(id, (error, result) => {
      if (error) {
        res.status(400).json({
          status: 400,
          message: error
        });
      }
      if (result) {
        res.status(201).json({
          status: 200,
          message: `User with ID ${id} was found`,
          data: result
        });
      }
    });
  },

  // UC-205
  editUserById: (req, res) => {
    let id = req.params.id;
    userDatabase.editById(id, req.body, (error, result) => {
      if (error) {
        res.status(404).json({
          error
        });
      } else {
        res.status(200).json({
          status: 200,
          message: 'Server edit user endpoint',
          data: result
        });
      }
    });
  },

  // UC-206
  deleteUserById: (req, res) => {
    const id = req.params.id;
    userDatabase.deleteById(id, (error, result) => {
      if (error) {
        res.status(404).json({
          error
        });
      } else {
        res.status(200).json({
          status: 200,
          message: `Server- User with ID: ${id} removed`
        });
      }
    });
  }
};

module.exports = controller;