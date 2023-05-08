const assert = require('assert')
const userDatabase = require('../../database/inmemdb_user')

let controller = {

  validateUser:(req, res, next) => {
    let user = req.body
    let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = user
    try {
      assert(typeof firstName === 'string', 'firstName must be a string')
      assert(typeof lastName === 'string', 'lastName must be a string')
      assert(typeof street === 'string', 'street must be a string')
      assert(typeof city === 'string', 'city must be a string')
      assert(typeof isActive === 'boolean', 'isActive must be a boolean')
      assert(typeof emailAddress === 'string', 'emailAddress must be a string')
      assert(typeof password === 'string', 'password must be a string')
      assert(typeof phoneNumber === 'string', 'phoneNumber must be a string')
      next()
    } catch(err) {
      const error = {
        status: 400,
        message: err.message
      }
      next(error)
    }
  },
  // UC-201
  addUser:(req, res) => {
    userDatabase.add(req.body, (error, result) => {
      if(error) {
        console.log(`index.js : ${error}`)
        res.status(401).json({
          status: 401,
          message: error
        })
      }
      if(result) {
        console.log(`index.js : User successfully added`)
        res.status(201).json({
          status: 201,
          message: "Server register user endpoint",
          data: result
        })
      }
    })
  },
  // UC-202
  getAllUsers:(req, res) => {
    userDatabase.getAll((result) => {
      res.status(200).json({
        status: 200,
        message: "Server get users endpoint",
        data: result
      })
    })
  },

  // UC-203
  getUserProfile:(req, res) => {
    res.status(200).json({
      status: 200,
      message: "Receive profile data functionality not yet added",
    })
  },

  // UC-204
  getUserById:(req, res) => {
    const id = req.params.id
    userDatabase.getById(id, (error, result) => {
      if(error) {
        res.status(401).json({
          status: 401,
          message: error
        })
      }
      if(result) {
        res.status(201).json({
          status: 201,
          message: `User with ID ${id} was found`,
          data: result
        })
      }
    })
  },

  // UC-205
  editUserById:(req, res) => {
    let id = req.params.id
    id = parseInt(id)
    let user = usersDatabase.filter(user => user.id == id)
    const index = usersDatabase.findIndex(user => { return user.id === id })

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
  },

  // UC-206
  deleteUserById:(req, res) => {
    const id = req.params.id
    const index = usersDatabase.findIndex(user => { return user.id == id })
    usersDatabase.splice(index, 1)

    if (index !== -1) {
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
  }
}

module.exports = controller