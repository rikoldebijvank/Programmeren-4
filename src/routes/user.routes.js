const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

// UC-201
router.post("/user", userController.validateUser, userController.addUser)

// UC-202
router.get("/user", userController.getUserByIdWithQuery)

// UC-203
router.get("/user/profile", userController.getUserProfile)

// UC-204-206
router.route("/user/:id")
  .get(userController.getUserById)
  .put(userController.validateUser, userController.editUserById)
  .delete(userController.deleteUserById)

module.exports = router
