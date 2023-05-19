const assert = require('assert');
const mealDatabase = require('../util/inmemdb_user');
const pool = require('../util/mysql-db');

let controller = {
  validateMeal: (req, res, next) => {

  },

  // UC-301
  addMeal: (req, res, next) => {

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