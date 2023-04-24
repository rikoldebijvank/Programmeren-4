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
  const lastName = req.query.lastName
  const isActive = req.query.isActive

  if (!lastName && !isActive) {
    res.status(200).json({
      status: 200,
      message: "Server get users endpoint",
      data: usersDatabase
    })
  } else {
    console.log(lastName, isActive)
    console.log(usersDatabase)
    const user = usersDatabase.filter((item) => {
      //if (lastName != null) {
      if (item.lastName == lastName) {
        return true
      }
      //}
      // if (isActive != null) {
      //   item.isActive == isActive
    }
    )
    console.log(user);

    res.status(200).json({
      status: 200,
      message: "Server get users by lastName/isActive endpoint",
      data: user
    })
  }
})

// UC-203
router.get("/api/user/profile", (req, res) => {
  const user = usersDatabase[0]
  res.status(200).json({
    status: 200,
    message: "Server user profile endpoint",
    data: user
  })
})

// UC-204-206
router.route("/api/user/:id")
  .get((req, res) => {
    const id = req.params.id
    const user = usersDatabase.filter((item) => item.id == id)
    console.log(user);
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
    console.log(usersDatabase[index], index);
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
