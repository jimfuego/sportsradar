/**
 * @file gameTracker.ts
 *
 * This set of classes is used to pool currnt live games,
 * and simplify their retrieval for the scheduler.
 */
import ScheduleService from '../services/schedule-service';

class LiveGame {
  readonly gameId: string;
  players: any = null;
  playIndex: number;
  constructor(gameId: string) {
    this.gameId = gameId;
    this.playIndex = 0;
  }
  get _playIndex() {
    return this.playIndex;
  }
  async init() {
    if (!this.players) {
      await ScheduleService.getLiveData(this.gameId).then((liveData) => {
        this.players = liveData.gameData.players;
        // console.log(this.players)
      });
    }
  }
  incrementPlayIndex(increment: number) {
    this.playIndex += increment;
  }
  async getRecentUpdates() {
    await ScheduleService.getUpdatedData(this.gameId, this.playIndex)
      .then((update) => {
        let { plays: plays, inProgress: inProgress } = update;
        // check status
        if (plays.length > 0) {
          // write to bronze
          // Don't forget to add a hash id (gameId + playIndex)
          plays.forEach((play: any) => {
            let writeData = this.reduceToBronzeEntry(play);
          });
        }
        if (inProgress) {
          // update playIndex
          this.incrementPlayIndex(plays.length);
        } else {
          // game ended
          // remove LiveGame
        }
      })
      .catch((err) => {});
  }
  reduceToBronzeEntry(play: any) {
    // {
    //   playerID: ''
    //   playerName: ''
    //   teamID: ''
    //   teamName: ''
    //   playerAge: ''
    //   playerNumber: ''
    //   playerPosition: ''
    //   assists: ''
    //   goals: ''
    //   hits: ''
    //   points: ''
    //   penaltyMinutes: ''
    // }
  }
}

class GamePool {
  liveGames: Record<string, LiveGame> = {};
  async addGame(gameId: string) {
    if (!this.isTrackingGame(gameId)) {
      this.liveGames[gameId] = new LiveGame(gameId);
      await this.liveGames[gameId].init();
    }
  }
  addGames(games: string[]) {
    games.forEach((game) => {
      this.addGame(game);
    });
  }
  removeGame(gameId: string) {
    if (this.isTrackingGame(gameId)) {
      delete this.liveGames[gameId];
    }
  }
  getUpdates() {
    Object.keys(this.liveGames).forEach((gameId) => {
      this.liveGames[gameId].getRecentUpdates();
    });
  }
  isTrackingGame(gameId: string) {
    return Object.keys(this.liveGames).includes(gameId);
  }
  isActive() {
    return Object.keys(this.liveGames).length > 0;
  }
}

export { GamePool, LiveGame };
