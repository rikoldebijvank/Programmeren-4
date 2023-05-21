const assert = require('assert');
const mealDatabase = require('../util/inmemdb_user');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const logger = require('../util/utils').logger;

module.exports = {
  login: (req, res, next) => {
    logger.info('Login function called');
    const { emailAddress, password } = req.body;
    const query = {
      sql: 'SELECT * FROM user WHERE emailAddress=?',
      values: [emailAddress]
    };

    pool.getConnection(function(err, connection) {
      if (err) {
        next({
          status: 500,
          message: err.code
        });
      }
      connection.query(query, function(error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results && results.length === 1) {
          // Er is een user met een emailadres
          const user = results[0];
          if (user.password === password) {
            // Haal password eruit
            const { password, ...user } = results[0];
            logger.debug(`password: ${password}`);
            // Email en password zijn correct
            jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' }, function(err, token) {
              if (err) next(err);
              if (token) {
                logger.info('Login successful');
                res.status(200).json({
                  status: 200,
                  message: `User with email address ${emailAddress} successfully logged in`,
                  data: {
                    ...user,
                    token
                  }
                });
              }
            });
          } else {
            logger.info('Wrong password');
            res.status(403).json({
              status: 403,
              message: 'Not authorized',
              data: []
            });
          }
        } else {
          logger.info('Email address not found');
          res.status(404).json({
            status: 404,
            message: `User with email ${emailAddress} not found`,
            data: []
          });
        }
      });
    });
  },

  validateLogin: (req, res, next) => {
    let info = req.body;
    let { emailAddress, password } = info;
    try {
      assert(typeof emailAddress === 'string', 'Email must be a string');
      assert(typeof password === 'string', 'Password must be a string');
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

  validateToken: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.info('Authorization header missing token');
      res.status(401).json({
        status: 401,
        message: 'Authorization header missing',
        data: []
      });
    } else {
      // Haal het woord 'Bearer ' uit de token string
      const token = authHeader.substring(7, authHeader.length);
      logger.debug(`token: ${token}`);

      jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
          logger.info('Token does not match user');
          res.status(401).json({
            status: 401,
            message: 'Not authorized',
            data: []
          });
        }
        if (payload) {
          logger.info('Token verified');
          req.userId = payload.id;
          next();
        }
      });
    }
  }
};