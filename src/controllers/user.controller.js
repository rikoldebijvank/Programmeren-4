let usersDatabase = []
let userId = 0

let controller = {

  addUser:(req, res) => {
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
  },

  getAllUsers:(req, res) => {
    res.status(200).json({
      status: 200,
      message: "Server get users endpoint",
      data: usersDatabase
    })
  },

  getUserProfile:(req, res) => {
    res.status(200).json({
      status: 200,
      message: "Receive profile data functionality not yet added",
    })
  },

  getUserById:(req, res) => {
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
  },

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