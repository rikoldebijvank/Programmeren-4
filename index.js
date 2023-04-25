const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const userRouter = require('./src/routes/user.routes')
const port = process.env.PORT || 3000

app.use(bodyParser.json())

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

app.use(userRouter)

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

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err)
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

module.exports = app
