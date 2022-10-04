import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app, server, cronJob, liveUpdatesJob, silverJob } from '../index';
chai.use(chaiHttp);

describe('Our lovely server', () => {
  //  test test
  it('Should always pass', function () {
    expect(1).to.equal(1);
  });

  // GET / Test
  it('GET /', function (done) {
    chai
      .request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // cleanup
  after(() => {
    server.close();
    cronJob.stop();
    liveUpdatesJob.stop();
    silverJob.stop();
  });
});
