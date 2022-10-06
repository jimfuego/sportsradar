/**
 * @file gameTracker.ts
 *
 * This set of classes is used to pool currnt live games,
 * and simplify their retrieval for the scheduler.
 */
import ScheduleService from '../services/schedule-service';
import { writeEntriesToBronze } from '../services/sql-service';

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

class LiveGame {
  readonly gameId: string;
  players: any = null;
  playIndex: number;

  constructor(gameId: string) {
    this.gameId = gameId;
    this.playIndex = -1;
  }

  get _playIndex() {
    return this.playIndex;
  }

  getPlayerBio(playerId: string) {
    return this.players[`ID${playerId.toString()}`];
  }

  async init() {
    if (!this.players) {
      await ScheduleService.getLiveData(this.gameId).then((liveData) => {
        this.players = liveData.gameData.players;
      });
    }
  }

  incrementPlayIndex(increment: number) {
    this.playIndex += increment;
  }

  async getRecentUpdates() {
    let writeData: BronzeEntry[] = [];
    return await ScheduleService.getUpdatedData(this.gameId, this.playIndex)
      .then(async (update) => {
        let { plays: plays, inProgress: inProgress } = update;
        console.log('plays length', plays.length);
        plays.forEach((play: any, i: number) => {
          console.log('i', i);
          let entries = this.reduceToBronzeEntry(play);
          console.log('entries len', entries.length);
          entries.forEach((entry) => writeData.push(entry));
          // this.reduceToBronzeEntry(play).forEach(entry => {
          //   console.log('entry: ', entry)
          //   writeData.push(entry)
          // });
        });
        await writeEntriesToBronze(writeData)
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

  playReducer(player: any, result: any) {
    let playDetails: Record<string, number> = {
      assists: 0,
      goals: 0,
      hits: 0,
      points: 0,
      penaltyMinutes: 0,
    };
    let playerType = player.playerType;
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

  reduceToBronzeEntry(play: any): BronzeEntry[] {
    console.log('!');
    if (Object.keys(play).includes('players')) {
      let players = play.players;
      let result = play.result;
      let entries: BronzeEntry[] = players.map((p: Player) => {
        let player = p;
        let playerId = player.player?.id || 'unavailable';
        let playerName = player.player?.fullName?.toString();
        let playerBio = this.getPlayerBio(playerId.toString());
        let playDetails = this.playReducer(player, result);
        return {
          playerId: playerId || 'unavailable',
          playerName: playerName || 'unavailable',
          // teamId: playerBio.currentTeam.id|| 'unavailable',
          teamId: playerBio || 'unavailable',
          teamName: playerBio?.currentTeam?.name || 'unavailable',
          playerAge: playerBio?.currentAge || 'unavailable',
          playerNumber: playerBio?.primaryNumber || 'unavailable',
          playerPosition: playerBio?.primaryPosition?.name || 'unavailable',
          assists: playDetails?.assists || 'unavailable',
          goals: playDetails?.goals || 'unavailable',
          hits: playDetails?.hits || 'unavailable',
          points: playDetails?.points || 'unavailable',
          penaltyMinutes: playDetails?.penaltyMinutes || 'unavailable',
          playerType: result?.event || 'unavailable',
          eventHash: 'sha256(gameId + playId, playerId)' || 'unavailable',
        };
      });
      console.log(entries.length);
      return entries;
    }
    console.log('should not happen');
    return [];
  }
}

class GamePool {
  liveGames: Record<string, LiveGame> = {};

  get _activeGames() {
    return Object.keys(this.liveGames);
  }

  async addGame(gameId: string) {
    let tracking = this.isTrackingGame(gameId);
    if (!tracking) {
      this.liveGames[gameId] = new LiveGame(gameId);
      await this.liveGames[gameId].init();
    }
  }

  addGames(games: string[]) {
    games.forEach(async (game) => {
      await this.addGame(game);
    });
  }

  removeGame(gameId: string) {
    if (this.isTrackingGame(gameId)) {
      delete this.liveGames[gameId];
    }
  }

  async getUpdates() {
    Object.keys(this.liveGames).forEach(async (gameId) => {
      let inProgress = await this.liveGames[gameId].getRecentUpdates();
      if (!inProgress) {
        this.removeGame(gameId);
      }
    });
  }

  isTrackingGame(gameId: string) {
    let includes = Object.keys(this.liveGames).includes(gameId);
    if (includes) {
      return true;
    }
    return false;
  }

  isActive() {
    return Object.keys(this.liveGames).length > 0;
  }
}

export { GamePool, LiveGame };
