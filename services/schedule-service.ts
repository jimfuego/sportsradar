import axios from 'axios';
import { LiveGame } from '../utils/gameTracker';

enum GameState { // comments denote abstractGameState field (for reference)
  IN_PROGRESS = '3', // Live
  SCHEDULED = '1', // Preview
  FINAL = '6', // Final
}

export default class ScheduleService {
  /**
   * Gets today's schedule of games.
   *
   * @returns {Promise<JSON>} pertaining to today's schedule
   */
  static async getSchedule(): Promise<any[]> {
    const url = `https://statsapi.web.nhl.com/api/v1/schedule`;
    return await axios
      .get(url)
      .then((res) => {
        if (res) {
          const data = res.data;
          const games = data.dates[0].games;
          return games;
        }
      })
      .catch(() => {
        return [];
      });
  }

  /**
   * Retrieves game by ID from the NHL API and saves it to bronze, if the data is
   * not already present.
   *
   * @returns {Promise<Record<string, string>[]>} pertaining to the status of requests
   */
  static async getGamesById(
    gameIds: string[]
  ): Promise<Record<string, string>[]> {
    const response: Record<string, string>[] = [];
    gameIds.forEach(async (gameId) => {
      const liveGame = new LiveGame(gameId);
      return await liveGame.init().then(async (isGame) => {
        if (isGame) {
          return await liveGame
            .getRecentUpdates()
            .then(() => {
              response.push({ gameId: 'Success' });
            })
            .catch((err) => {
              console.log(err);
              response.push({ gameId: err });
            });
        }
      });
    });
    return response;
  }

  /**
   * Retrieves all currently live games.
   * @returns {Promise<string[]>} of live gameIds
   */
  static async getLiveGames(): Promise<string[]> {
    return await this.getSchedule()
      .then((games) => {
        const liveGames: string[] = [];
        for (let i = 0; i < games.length; i++) {
          if (games[i].status.codedGameState === GameState.IN_PROGRESS) {
            const gamePk: string = games[i].gamePk.toString();
            liveGames.push(gamePk);
          }
        }
        return liveGames;
      })
      .catch(() => {
        return [];
      });
  }

  /**
   *
   * @param gameId
   * @returns
   */
  static async getLiveData(gameId: string): Promise<Record<string, any>> {
    const url = `https://statsapi.web.nhl.com/api/v1/game/${gameId}/feed/live`;
    return await axios
      .get(url)
      .then(({ data: { gameData: gameData, liveData: liveData } }) => {
        return {
          gameData: gameData,
          liveData: liveData,
        };
      })
      .catch(() => {
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
          const inProgress = codedGameState === GameState.IN_PROGRESS;
          const recentPlays = allPlays.filter((play: any) => {
            return play.about.eventIdx > playIndex;
          });
          return {
            plays: recentPlays,
            inProgress: inProgress,
          };
        }
      )
      .catch(() => {
        // log playIdx for error, save to table, and retreive stats on another job later (2x per day?)
        return {};
      });
  }
}
