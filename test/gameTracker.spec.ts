/**
 * @file gameTracker.spec.ts
 * This file tests the specifications of our
 * LiveGame and GameTracker classes.
 */
import chai, { expect } from 'chai';
import { GamePool } from '../utils/gameTracker';

describe('Our lovely GameTracker (and LiveGame)', () => {
  const gameIds = [
    '20220101',
    '20220102',
    '20220103',
    '20220104',
    '20220105',
    '20220106',
  ]; // not real games

  it('Checks individual game adds', function () {
    const gp = new GamePool();
    expect(gp.isActive()).to.be.false;
    gameIds.forEach((id) => {
      gp.addGame(id);
      expect(gp.isTrackingGame(id)).to.be.true;
      expect(gp.isActive()).to.be.true;
    });
  });

  it('Checks bulk game adds', function () {
    const gp = new GamePool();
    expect(gp.isActive()).to.be.false;
    gp.addGames(gameIds);
    expect(gp.isActive()).to.be.true;
    gameIds.forEach((id) => {
      expect(gp.isTrackingGame(id)).to.be.true;
      expect(gp.isTrackingGame('72842837')).to.be.false;
    });
  });

  it('Checks that games are properly removed', function () {
    const gp = new GamePool();
    expect(gp.isActive()).to.be.false;
    gp.addGames(gameIds);
    expect(gp.isActive()).to.be.true;
    gameIds.forEach((id) => {
      expect(gp.isTrackingGame(id)).to.be.true;
      gp.removeGame(id);
      expect(gp.isTrackingGame(id)).to.be.false;
    });
    expect(gp.isActive()).to.be.false;
  });
});
