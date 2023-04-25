const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

// UC-201
router.post("/api/user", userController.validateUser, userController.addUser)

// UC-202
router.get("/api/user", userController.getAllUsers)

// UC-203
router.get("/api/user/profile", userController.getUserProfile)

// UC-204-206
router.route("/api/user/:id")
  .get(userController.getUserById)
  .put(userController.editUserById)
  .delete(userController.deleteUserById)

module.exports = router
