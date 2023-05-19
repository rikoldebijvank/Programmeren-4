const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

// UC-201
router.post('/', userController.validateUser, userController.addUser);

// UC-202
router.get('/', userController.getUserByIdWithQuery);

// UC-203
router.get('/profile', userController.getUserProfile);

// UC-204-206
router.route('/:id')
  .get(userController.getUserById)
  .put(authController.validateToken, userController.validateUser, userController.editUserById)
  .delete(userController.deleteUserById);

module.exports = router;
