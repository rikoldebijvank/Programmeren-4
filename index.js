const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

app.use(bodyParser.json())

let usersDatabase = []
let userId = 0
let mealsDatabase = []
let mealId = 0

app.use("*", (req, res, next) => {
  const method = req.method;
  console.log(`Methode ${method}`)
  next()
})

// UC-102
app.get("/api/info", (req, res) => {
  res.status(200).json(
    {
      status: 200,
      message: "Server info-endpoint",
      data: {
        studentName: "Rik Olde Bijvank",
        studentNumber: 2202811,
        description: "Welkom bij de server API van de share a meal app."
      }
    }
  )
})

// UC-201
app.post("/api/user", (req, res, next) => {
  let user = req.body
  userId++
  user = {
    userId,
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
app.get("/api/user", (req, res) => {
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
app.get("/api/user/profile", (req, res) => {
  const user = usersDatabase[0]
  res.status(200).json({
    status: 200,
    message: "Server user profile endpoint",
    data: user
  })
})

// UC-204-206
app.route("/api/user/:userId")
  .get((req, res) => {
    const id = req.params.userId
    const user = usersDatabase.filter((item) => item.userId == id)
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
    let id = req.params.userId
    id = parseInt(id)
    let user = usersDatabase.filter(user => user.userId == id)
    const index = usersDatabase.findIndex(user => { return user.userId == id })

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
    const id = req.params.userId
    const index = usersDatabase.findIndex(user => { return user.userId == id })
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

// UC-301
app.post("/api/meal", (req, res, next) => {
  let meal = req.body
  console.log(meal);
  mealId++
  meal = {
    id: mealId,
    ...meal
  }
  mealsDatabase.push(meal)
  res.status(201).json({
    status: 201,
    message: "Server- push meal endpoint",
    data: meal
  })
})

// UC-303
app.get("/api/meal", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Server- get meal endpoint",
    data: mealsDatabase
  })
})

// UC-304
app.get("/api/meal/:mealId", (req, res) => {
  const mealId = req.params.mealId
  const meal = mealsDatabase.filter((item) => item.id == mealId)
  if (meal.length > 0) {
    console.log(meal);
    res.status(200).json({
      status: 200,
      message: "Server- get meal by id endpoint",
      data: meal
    })
  } else {
    res.status(404).json({
      status: 404,
      message: "Server- get meal by id not found endpoint",
      data: `Meal with ID ${mealId} not found`
    })
  }
})

app.use("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "Endpoint not found",
    data: {}
  })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

module.exports = app
