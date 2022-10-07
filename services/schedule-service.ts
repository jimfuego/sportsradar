import axios from 'axios';
import { LiveGame } from '../utils/gameTracker';

enum GameState { // comments denote abstractGameState field (for reference)
  IN_PROGRESS = '3', // Live
  SCHEDULED = '1', // Preview
  FINAL = '6', // Final
}

export default class ScheduleService {
  /**
   *
   * @returns
   */
  static async getSchedule(): Promise<any[]> {
    const url = `https://statsapi.web.nhl.com/api/v1/schedule`;
    return await axios
      .get(url)
      .then((res) => {
        if (res) {
          let data = res.data;
          let games = data.dates[0].games;
          return games;
        }
      })
      .catch((err) => {
        return [];
      });
  }

  /**
   * Retrieves game by ID from the NHL API and saves it to bronze, if the data is
   * not already present.
   *
   * @returns
   */
  static async getGamesById(
    gameIds: string[]
  ): Promise<Record<string, string>[]> {
    let response: Record<string, string>[] = [];
    gameIds.forEach(async (gameId) => {
      const liveGame = new LiveGame(gameId);
      await liveGame.init();
      return await liveGame
        .getRecentUpdates()
        .then(() => {
          response.push({ gameId: 'Success' });
        })
        .catch((err) => {
          console.log(err);
          response.push({ gameId: err });
        });
    });
    return response;
  }

  /**
   *
   * @returns
   */
  static async getLiveGames(): Promise<string[]> {
    return await this.getSchedule()
      .then((games) => {
        let liveGames: string[] = [];
        for (let i = 0; i < games.length; i++) {
          if (games[i].status.codedGameState === GameState.IN_PROGRESS) {
            let gamePk: string = games[i].gamePk.toString();
            liveGames.push(gamePk);
          }
        }
        return liveGames;
      })
      .catch((err) => {
        return [];
      });
  }

  /**
   *
   * @param gameId
   * @returns
   */
  static async getLiveData(
    gameId: string = '2022010074'
  ): Promise<Record<string, any>> {
    const url = `https://statsapi.web.nhl.com/api/v1/game/${gameId}/feed/live`;
    return await axios
      .get(url)
      .then(({ data: { gameData: gameData, liveData: liveData } }) => {
        return {
          gameData: gameData,
          liveData: liveData,
        };
      })
      .catch((err) => {
        // log timestamp for error, save to table,
        // and retreive stats on another job later(2x per day ?)
        return {};
      });
  }

  // current
  /**
   *
   * @param gameId
   * @param playIndex
   * @returns Promise with a list of recent plays and whether or not
   * the game has ended (true=inprogress)
   */
  static async getUpdatedData(
    gameId: string,
    playIndex: number
  ): Promise<Record<string, any>> {
    return await this.getLiveData(gameId)
      .then(
        ({
          gameData: {
            status: { codedGameState: codedGameState },
          },
          liveData: {
            plays: { allPlays: allPlays },
          },
        }) => {
          let inProgress = codedGameState === GameState.IN_PROGRESS;
          let recentPlays = allPlays.filter((play: any) => {
            return play.about.eventIdx > playIndex;
          });
          return {
            plays: recentPlays,
            inProgress: inProgress,
          };
        }
      )
      .catch((err) => {
        // log playIdx for error, save to table, and retreive stats on another job later (2x per day?)
        return {};
      });
  }
}
