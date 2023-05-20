const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/auth.controller');

// UC-301
router.post('/', authController.validateToken, mealController.validateMealWhenAdded, mealController.addMeal);

// UC-303
router.get('/', authController.validateToken,  mealController.getAll);

router.route('/:id')
  // UC-304
  .get(authController.validateToken, mealController.getMealById)
  // UC-302
  .put(authController.validateToken, mealController.validateMealWhenUpdated, mealController.editMealById)
  // UC-305
  .delete(authController.validateToken, mealController.deleteMealById);

module.exports = router;