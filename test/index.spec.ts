import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../index';
chai.use(chaiHttp);

describe('Our lovely server', () => {
  it('Should always pass', function () {
    expect(1).to.equal(1);
  });
  it('GET /', function (done) {
    chai
      .request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
    after(() => server.close());
  });
});
