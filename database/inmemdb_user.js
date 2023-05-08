const _userdb = []
const timeout = 500
let id = 0

module.exports = {
  // UC-201
  add:(user, callback) => {
    console.log("Add User Called")

    setTimeout(() => {
      if(
        user &&
        user.email &&
        _userdb.filter((item) => item.email === user.email).length > 0
      ) {
        const error = 'A user with this email already exists'
        console.log(error)
        // Callback wordt aangeroepen met error als message en undefined als result
        callback(error, undefined)
      } else {
        const userToAdd = {
          id: id++,
          ...user
        }
        _userdb.push(userToAdd)
        callback(undefined, userToAdd)
      }
    }, timeout)
  },

  // UC-202
  getAll:(callback) => {
    console.log("Get All Users Called")
    setTimeout(() => {
      callback(undefined, _userdb)
    }, timeout)
  },

  // UC-204
  getById:(userId, callback) => {
    console.log("Get User By ID Called")

    setTimeout(() => {
      let filteredUsers = _userdb.filter((item) => item.id === userId)
      if(filteredUsers.length > 0) {
        callback(undefined, filteredUsers[0])
      } else {
        const error = {
          status: 401,
          message: `User with ID ${userId} not found`
        }
        callback(error, undefined)
      }
    }, timeout)
  },

  // UC-205
  editById:(userId, update, callback) => {
    console.log("Edit User By ID Called")
  }
}