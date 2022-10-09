/**
 * @file index.spec.ts
 * This file tests the specifications of our
 * Express server
 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import nock from 'nock';
import { server, cronJob, liveUpdatesJob, silverJob } from '../index';

chai.use(chaiHttp);

describe('Our lovely server', () => {
  const agent = chai.request.agent('http://localhost:7777');
  const apiRoute = '/api/v1/app';

  //  test test
  it('Should always pass', function () {
    expect(1).to.equal(1);
  });

  it('GET /', function (done) {
    agent.get('/').end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      done();
    });
  });

  it('GET /bronze/', function (done) {
    agent.get(`${apiRoute}/bronze`).end((err, res) => {
      expect(res.ok).to.be.true;
      expect(res).to.have.status(200);
      done();
    });
  });

  it('GET /bronze/game/:id', function (done) {
    agent.get(`${apiRoute}/bronze/game/12345`).end((err, res) => {
      expect(res.ok).to.be.true;
      expect(res).to.have.status(200);
      done();
    });
  });

  it('GET /bronze/player/:id', function (done) {
    agent.get(`${apiRoute}/bronze/player/12345`).end((err, res) => {
      expect(res.ok).to.be.true;
      expect(res).to.have.status(200);
      done();
    });
  });

  it('GET /bronze/garbage', function (done) {
    agent.get(`${apiRoute}/bronze/garbage`).end((err, res) => {
      expect(res.ok).to.be.false;
      expect(res).to.have.status(404);
      done();
    });
  });

  it('POST /bronze/', function (done) {
    agent
      .post(`${apiRoute}/bronze`)
      .send({})
      .end((err, res) => {
        expect(res.ok).to.be.true;
        expect(res).to.have.status(201);
        done();
      });
  });

  it('POST /seed', function (done) {
    agent
      .post(`${apiRoute}/bronze/seed`)
      .send({})
      .end((err, res) => {
        expect(res.ok).to.be.true;
        expect(res).to.have.status(201);
        done();
      });
  });

  it('POST /add (Success)', function (done) {
    agent
      .post(`${apiRoute}/bronze/add`)
      .send({
        gameIds: [],
      })
      .end((err, res) => {
        expect(res.ok).to.be.true;
        expect(res).to.have.status(201);
        done();
      });
  });

  it('POST /add (Failure)', function (done) {
    agent
      .post(`${apiRoute}/bronze/add`)
      .send({})
      .end((err, res) => {
        expect(res.ok).to.be.false;
        expect(res).to.have.status(406);
        done();
      });
  });

  // afterEach(() => nock.cleanAll());
  // cleanup
  after(() => {
    server.close();
    cronJob.stop();
    liveUpdatesJob.stop();
    silverJob.stop();
    nock.restore();
  });
});
