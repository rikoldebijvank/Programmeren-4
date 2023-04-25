const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
chai.should()
chai.use(chaiHttp)
let database = []

describe('Manage users', () => {
  describe('UC-201 Register new user', () => {
    beforeEach((done) => {
      database = []
      done()
    })

    it('TC-201-1 Required input is missing when registering a user', (done) => {
      chai.request(server).post('/api/user').send({
        // firstName is missing
        lastName: 'lastNameTest1',
        street: 'testStreet1',
        city: 'testCity1',
        isActive: true,
        emailAddress: 'test1@gmail.com',
        password: 'testPassword1',
        phoneNumber: '0612345678'
      }).end((err, res) => {
        res.should.be.an('object')
        let { status, message } = res.body
        status.should.equals(400)
        message.should.be.a('string').that.equals('firstName must be a string')
        done()
      })
    })

    it('TC-201-5 registering user 1 successful', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'firstNameTest1',
          lastName: 'lastNameTest1',
          street: 'testStreet1',
          city: 'testCity1',
          isActive: true,
          emailAddress: 'test1@gmail.com',
          password: 'testPassword1',
          phoneNumber: '0612345678'
        })
        .end((err, res) => {
          checkConditions(res, 201)
          let { data } = res.body
          data.should.be.an('object')
          data.should.has.property('id').to.be.equal(1)
          data.should.has.property('firstName').to.be.equal('firstNameTest1')
          data.should.has.property('lastName').to.be.equal('lastNameTest1')
          data.should.has.property('street').to.be.equal('testStreet1')
          data.should.has.property('city').to.be.equal('testCity1')
          data.should.has.property('isActive').to.be.equal(true)
          data.should.has.property('emailAddress').to.be.equal('test1@gmail.com')
          data.should.has.property('password').to.be.equal('testPassword1')
          data.should.has.property('phoneNumber').to.be.equal('0612345678')
          done()
        })
    })
    it('TC-201-5 registering user 2 successful', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'firstNameTest2',
          lastName: 'lastNameTest2',
          street: 'testStreet2',
          city: 'testCity2',
          isActive: false,
          emailAddress: 'test2@gmail.com',
          password: 'testPassword2',
          phoneNumber: '0612345678'
        })
        .end((err, res) => {
          checkConditions(res, 201)
          let { data } = res.body
          data.should.be.an('object')
          data.should.has.property('id').to.be.equal(2)
          data.should.has.property('firstName').to.be.equal('firstNameTest2')
          data.should.has.property('lastName').to.be.equal('lastNameTest2')
          data.should.has.property('street').to.be.equal('testStreet2')
          data.should.has.property('city').to.be.equal('testCity2')
          data.should.has.property('isActive').to.be.equal(false)
          data.should.has.property('emailAddress').to.be.equal('test2@gmail.com')
          data.should.has.property('password').to.be.equal('testPassword2')
          data.should.has.property('phoneNumber').to.be.equal('0612345678')
          done()
        })
    })
  })

  describe('Server- retrieve user list', () => {
    it('TC-202-1 get all users successful', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .end((err, res) => {
          checkConditions(res, 200)
          let { data } = res.body
          data.should.be.an('array')
          data[0].should.has.property('id').to.be.equal(1)
          data[0].should.has.property('firstName').to.be.equal('firstNameTest1')
          data[0].should.has.property('lastName').to.be.equal('lastNameTest1')
          data[0].should.has.property('street').to.be.equal('testStreet1')
          data[0].should.has.property('city').to.be.equal('testCity1')
          data[0].should.has.property('isActive').to.be.equal(true)
          data[0].should.has.property('emailAddress').to.be.equal('test1@gmail.com')
          data[0].should.has.property('password').to.be.equal('testPassword1')
          data[0].should.has.property('phoneNumber').to.be.equal('0612345678')

          data[1].should.has.property('id').to.be.equal(2)
          data[1].should.has.property('firstName').to.be.equal('firstNameTest2')
          data[1].should.has.property('lastName').to.be.equal('lastNameTest2')
          data[1].should.has.property('street').to.be.equal('testStreet2')
          data[1].should.has.property('city').to.be.equal('testCity2')
          data[1].should.has.property('isActive').to.be.equal(false)
          data[1].should.has.property('emailAddress').to.be.equal('test2@gmail.com')
          data[1].should.has.property('password').to.be.equal('testPassword2')
          data[1].should.has.property('phoneNumber').to.be.equal('0612345678')
          done()
        })
    })
  })

  describe('Server- retrieve user profile', () => {
    it('TC-203-2 get user profile successful', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .end((err, res) => {
          checkConditions(res, 200)
          let { data } = res.body
          data.should.be.an('array')
          data[0].should.has.property('id').to.be.equal(1)
          data[0].should.has.property('firstName').to.be.equal('firstNameTest1')
          data[0].should.has.property('lastName').to.be.equal('lastNameTest1')
          data[0].should.has.property('street').to.be.equal('testStreet1')
          data[0].should.has.property('city').to.be.equal('testCity1')
          data[0].should.has.property('isActive').to.be.equal(true)
          data[0].should.has.property('emailAddress').to.be.equal('test1@gmail.com')
          data[0].should.has.property('password').to.be.equal('testPassword1')
          data[0].should.has.property('phoneNumber').to.be.equal('0612345678')
          done()
        })
    })
  })

  describe('Server- retrieve user by id', () => {
    it('TC-204-3 get user by id successful', (done) => {
      chai
        .request(server)
        .get('/api/user/2')
        .end((err, res) => {
          checkConditions(res, 200)
          let { data } = res.body
          data.should.be.an('array')
          data[0].should.has.property('id').to.be.equal(2)
          data[0].should.has.property('firstName').to.be.equal('firstNameTest2')
          data[0].should.has.property('lastName').to.be.equal('lastNameTest2')
          data[0].should.has.property('street').to.be.equal('testStreet2')
          data[0].should.has.property('city').to.be.equal('testCity2')
          data[0].should.has.property('isActive').to.be.equal(false)
          data[0].should.has.property('emailAddress').to.be.equal('test2@gmail.com')
          data[0].should.has.property('password').to.be.equal('testPassword2')
          data[0].should.has.property('phoneNumber').to.be.equal('0612345678')
          done()
        })
    })
  })

  describe('Server- user deleted', () => {
    it('TC-206-4 delete user successful', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .end((err, res) => {
          res.body.should.be.an('object')
          res.body.should.has.property('status').to.be.equal(200)
          res.body.should.has.property('message').to.be.equal('Server- User with ID: 1 removed')
          done()
        })
    })
  })

})

const checkConditions = function (res, status) {
  res.body.should.be.an('object')
  res.body.should.has.property('status').to.be.equal(status)
  res.body.should.has.property('message')
  res.body.should.has.property('data')
}
