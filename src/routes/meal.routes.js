const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');

// UC-301
router.post('/', mealController.addMeal);

// UC-303
router.get('/', mealController.getAll);

router.route('/:id')
  // UC-304
  .get(mealController.getMealById)
  .put(mealController.editMealById)
  .delete(mealController.deleteMealById);

module.exports = router;