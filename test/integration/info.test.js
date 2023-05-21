const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
chai.should();
chai.use(chaiHttp);

describe('Server-info', () => {
  it('TC-102- Server info', (done) => {
    chai
      .request(server)
      .get('/api/info')
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data');
        let { data } = res.body;
        data.should.be.an('object');
        data.should.has.property('studentName').to.be.equal('Rik Olde Bijvank');
        data.should.has.property('studentNumber').to.be.equal(2202811);
        done();
      });
  });
});