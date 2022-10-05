/**
 * @file gameTracker.spec.ts
 * This file tests the specifications of our
 * LiveGame and GameTracker classes.
 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app, server, cronJob, liveUpdatesJob, silverJob } from '../index';
chai.use(chaiHttp);

describe('Our lovely GameTracker (and LiveGame)', () => {
  //  test test
  it('Should always pass', function () {
    expect(1).to.equal(1);
  });

  // LiveGame
  // it('is a test', function (done) {

  // });

  // // GameTracker
  // it('is a test', function (done) {

  // });

  // // cleanup
  // after(() => {

  // });
});
