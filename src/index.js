const express = require('express')
const app = express()
const port = 3000

const users = {
  "name": "user1",
  "email": "user1@gmail.com"
}

// UC-102 Use Case
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

// UC-201 Use Case
app.post("/api/register", (req, res) => {
  res.status(201)
  console.log("User Registered")
})

// UC-202 Use Case
app.get("/api/user", (req, res) => {
  console.log("GET request for users completed")
})

// UC-203 Use Case
app.get("/api/user/profile", (req, res) => {
  console.log("GET request for user profile completed")
})

// UC-203 Use Case
app.get("/user/:id", (req, res) => {
  console.log("GET request for specific user completed (One param)")
  res.send("GET request by id completed")
})

// UC-204-206 Use Cases
app.route("/api/user")
  .get((req, res) => {
    console.log("GET request for specific user completed (Two params)")
    res.send("GET request by id and name completed")
  })

app.use("*", (req, res, next) => {
  const method = req.method;
  console.log(`Methode ${method}`)
  next()
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
