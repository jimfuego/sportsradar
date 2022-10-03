import { expect } from 'chai';
import app from '../index';

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

  it('GET /', function () {
    expect(1).to.equal(1);
  });
});
