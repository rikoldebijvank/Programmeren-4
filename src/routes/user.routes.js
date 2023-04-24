const express = require('express')
const router = express.Router()

let usersDatabase = []
let userId = 0

// UC-201
router.post("/api/user", (req, res, next) => {
  let user = req.body
  userId++
  user = {
    id: userId,
    ...user
  }
  usersDatabase.push(user)
  res.status(201).json({
    status: 201,
    message: "Server register user endpoint",
    data: user
  })

})

// UC-202
router.get("/api/user", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Server get users endpoint",
    data: usersDatabase
  })
})

// UC-203
router.get("/api/user/profile", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Receive profile data functionality not yet added",
  })
})

// UC-204-206
router.route("/api/user/:id")
  .get((req, res) => {
    const id = req.params.id
    const user = usersDatabase.filter((item) => item.id == id)
    if (user.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Server get user by id endpoint",
        data: user
      })
    } else {
      res.status(404).json({
        status: 404,
        message: `Server could not find user with id ${id}`
      })
    }
  })
  .put((req, res) => {
    let id = req.params.id
    id = parseInt(id)
    let user = usersDatabase.filter(user => user.id == id)
    const index = usersDatabase.findIndex(user => { return user.id == id })

    if (user.length > 0) {
      usersDatabase[index] = {
        ...user['0'],
        ...req.body
      }
      updatedUser = usersDatabase[index]

      res.status(200).json({
        status: 200,
        message: "Server edit user endpoint",
        data: updatedUser
      })
    } else {
      res.status(404).json({
        status: 404,
        message: `Server cannot edit user with id ${id}`
      })
    }
  })
  .delete((req, res) => {
    const id = req.params.id
    const index = usersDatabase.findIndex(user => { return user.id == id })
    usersDatabase.splice(index, 1)

    if (index != -1) {
      res.status(200).json({
        status: 200,
        message: `Server- User with ID: ${id} removed`,
      })
    } else {
      res.status(404).json({
        status: 404,
        message: `Server could not delete user with ID: ${id}`
      })
    }
  })

module.exports = router
