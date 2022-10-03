import { doesNotMatch } from 'assert';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../index';
chai.use(chaiHttp);

describe('Our lovely server', () => {
  // Called once before any of the tests in this block begin.
  // before(function(done) {
  //   app.listen(function(err: any) {
  //     if (err) { return done(err); }
  //     done();
  //   })
  // });

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
