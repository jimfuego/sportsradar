/**
 * @file gameTracker.ts
 *
 * This set of classes is used to pool currnt live games,
 * and simplify their retrieval for the scheduler.
 */
import ScheduleService from '../services/schedule-service';
import { insertToBronze } from '../services/sql-service';
import { createHmac } from 'node:crypto';

type Player = {
  player: {
    id: number;
    fullName: string;
    link: string;
  };
  playerType: string;
};

/**
 * Assumptions:
 *
 * hits, assists, goals, points, penaltyMinutes are all gathered on a
 * per-play basis. Aggregations will be done in silver or gold table xforms.
 */
type BronzeEntry = {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  playerAge: number;
  playerNumber: string;
  playerPosition: string;
  assists: number;
  goals: number;
  hits: number;
  points: number;
  penaltyMinutes: number;
  playerType: string;
  eventHash: string;
};

/**
 * Support class that handles data fetching for live games.
 * This class is not intended to be accessed directly, but is self contained.
 * Be sure to call init() after construction if using this class outside of
 * GamePool!
 */
class LiveGame {
  private readonly _gameId: string;
  public get gameId(): string {
    return this._gameId;
  }
  players: any = null;
  _playIndex: number;

  constructor(gameId: string) {
    this._gameId = gameId;
    this._playIndex = -1;
  }

  get playIndex() {
    return this._playIndex;
  }

  /**
   * Retrieves player and game data to be referenced directly when parsing live game data.
   * @returns
   */
  async init(): Promise<boolean> {
    if (!this.players) {
      return await ScheduleService.getLiveData(this.gameId).then((liveData) => {
        if (liveData?.gameData) {
          this.players = liveData.gameData.players;
          return true;
        }
        return false;
      });
    }
    return false;
  }

  /**
   * Retrieves played bio according to the given ID
   * @param playerId
   * @returns
   */
  getPlayerBio(playerId: string) {
    return playerId ? this.players[`ID${playerId.toString()}`] : 'unavailable';
  }

  /**
   * Used to increment the play index, which is used to filter new plays from
   * the live pudate response.
   * @param increment
   */
  incrementPlayIndex(increment: number) {
    this._playIndex += increment;
  }

  /**
   * Gets most recent updates on a LiveGame.
   * @returns
   */
  async getRecentUpdates() {
    const writeData: BronzeEntry[] = [];
    return await ScheduleService.getUpdatedData(this.gameId, this.playIndex)
      .then(async (update) => {
        const { plays: plays, inProgress: inProgress } = update;
        plays.forEach((play: any) => {
          const entries = this.reduceToBronzeEntry(play);
          entries.forEach((entry) => {
            writeData.push(entry);
          });
        });
        await insertToBronze(writeData)
          .then((res) => {
            this.incrementPlayIndex(plays.length);
          })
          .catch((err) => {
            return true; // keep game in progress for next retrieval
          });
        // }
        return inProgress;
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Takes a raw play (response from the server), and reduces it to the form that is
   * stored in bronze_table
   * @param play
   * @returns
   */
  reduceToBronzeEntry(play: any): BronzeEntry[] {
    if (Object.keys(play).includes('players')) {
      const players = play.players;
      const result = play.result;
      const eventIdx = play.about.eventIdx;
      const entries: BronzeEntry[] = players.map((p: Player) => {
        const player = p;
        const playerType = player.playerType;
        const playerId = player.player?.id || 'unavailable';
        const playerName = player.player?.fullName?.toString();
        const playerBio = this.getPlayerBio(playerId.toString());
        const playDetails = this.playReducer(player, result);
        // Assumption: players will not appear in the same play twice.
        // I dont think there is such thing as a double assist or double hit.
        // If there is, I would certainly like to see one.
        const secret = 'abcdefg';
        const hash = createHmac('sha256', secret)
          .update(`${eventIdx}${this.gameId}${playerId}${playerType}`)
          .digest('hex');
        return [
          this.gameId,
          playerId || 'unavailable',
          playerName || 'unavailable',
          playerBio?.currentTeam?.id || 'unavailable',
          playerBio?.currentTeam?.name || 'unavailable',
          playerBio?.currentAge || 'unavailable',
          playerBio?.primaryNumber || 'unavailable',
          playerBio?.primaryPosition?.name || 'unavailable',
          playDetails?.assists || 0,
          playDetails?.goals || 0,
          playDetails?.hits || 0,
          playDetails?.points || 0,
          playDetails?.penaltyMinutes || 0,
          playerType || 'unavailable',
          hash || 'unavailable',
        ];
      });
      return entries;
    }
    return [];
  }

  /**
   * Takes a player object (serrver response) and performs the necessary transformations
   * to apply to the to-be bronze-entry.
   * @param player
   * @param result
   * @returns
   */
  playReducer(player: any, result: any) {
    const playDetails: Record<string, number> = {
      assists: 0,
      goals: 0,
      hits: 0,
      points: 0,
      penaltyMinutes: 0,
    };
    const playerType = player.playerType;
    switch (result.event) {
      case 'Penalty': {
        if (playerType === 'PenaltyOn') {
          playDetails['penaltyMinutes'] = result.penaltyMinutes;
        }
        break;
      }
      case 'Goal': {
        playDetails['goals'] = playerType === 'Scorer' ? 1 : 0;
        playDetails['assists'] = playerType === 'Assist' ? 1 : 0;
        playDetails['points'] =
          playerType === 'Scorer' || playerType === 'Assist' ? 1 : 0;
        break;
      }
      case 'Hit': {
        playDetails['hits'] = playerType === 'Hitter' ? 1 : 0;
        break;
      }
      default: {
        break;
      }
    }
    return playDetails;
  }
}

/**
 * Class made to manage ongoing LiveGames (above).
 */
class GamePool {
  liveGames: Record<string, LiveGame> = {};

  get activeGames() {
    return Object.keys(this.liveGames);
  }

  /**
   * Adds a game to the GamePool by its gameId.
   * @param gameId
   */
  async addGame(gameId: string) {
    const tracking = this.isTrackingGame(gameId);
    if (!tracking) {
      console.log(`Adding LiveGame ${gameId} to GamePool!`);
      this.liveGames[gameId] = new LiveGame(gameId);
      await this.liveGames[gameId].init();
    }
  }

  /**
   * Batch add for gameIds.
   * @param games
   */
  addGames(games: string[]) {
    games.forEach(async (game) => {
      await this.addGame(game);
    });
  }

  /**
   * Removes a game by its corresponding id.
   * @param gameId
   */
  removeGame(gameId: string) {
    if (this.isTrackingGame(gameId)) {
      delete this.liveGames[gameId];
    }
  }

  /**
   * Goes through each LiveGame retrieves the most recent updates, and writes those
   * updates to bronze.
   */
  async getUpdates() {
    Object.keys(this.liveGames).forEach(async (gameId) => {
      const inProgress = await this.liveGames[gameId].getRecentUpdates();
      if (!inProgress) {
        console.log(`End of ${gameId}`);
        this.removeGame(gameId);
      }
    });
  }

  /**
   * Used to check if the GamPool is alreqady tracking a particular game.
   * @param gameId
   * @returns
   */
  isTrackingGame(gameId: string) {
    const includes = Object.keys(this.liveGames).includes(gameId);
    if (includes) {
      return true;
    }
    return false;
  }

  /**
   * Used to dtermine whether or no the GamePool is currenty tracking any LiveGames.
   * @returns
   */
  isActive() {
    return Object.keys(this.liveGames).length > 0;
  }
}

export { GamePool, LiveGame };
