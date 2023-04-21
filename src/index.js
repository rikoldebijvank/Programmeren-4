const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

app.use(bodyParser.json())

let mealsDatabase = []
let id = 0

app.all("*", (req, res, next) => {
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
        studentName: "student1",
        studentNumber: 1234567,
        description: "Welkom bij de server API van de share a meal app."
      }
    }
  )
})

// UC-201
app.post("/api/register", (req, res, next) => {
  res.status(201)
  console.log("User Registered")
})

// UC-202
app.get("/api/user/:name?/:id?", (req, res) => {
  res.status(200).json(
    {
      status: 200,
      message: "Server user by name/id endpoint",
      data: {

      }
    }
  )
  console.log("GET request for users completed")
})

// UC-203
app.get("/api/user/profile", (req, res) => {
  console.log("GET request for user profile completed")
})

// UC-204-206
app.route("/api/user/:id")
  .get((req, res) => {
    console.log("GET request for specific user completed")
    res.send("GET request by id completed")
  })
  .put((req, res) => {
    console.log("POST request for specific user completed")
    res.send("PUT request by id completed")
  })
  .delete((req, res) => {
    console.log("DELETE request for specific user completed")
    res.send("DELETE request by id completed")
  })

// UC-301
app.post("/api/meal", (req, res, next) => {
  let meal = req.body
  console.log(meal);
  id++
  meal = {
    id,
    ...meal
  }
  mealsDatabase.push(meal)
  res.status(201).json({
    status: 201,
    message: "Server- push meal endpoint",
    data: meal
  })
})

app.get("/api/meal", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Server- get meal endpoint",
    data: mealsDatabase
  })
})

app.get("/api/meal/:mealId", (req, res) => {
  const mealId = req.params.mealId
  let meal = mealsDatabase.filter((item) => item.id = mealId)
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
