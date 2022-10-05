import axios from 'axios';

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
   *
   * @returns
   */
  static async getLiveGames(): // currentLiveGames: Set<string>
  Promise<string[]> {
    return await this.getSchedule()
      .then((games) => {
        return games.map(
          ({ gamePk, status: { codedGameState: gameStateId } }) => {
            if (gameStateId === GameState.IN_PROGRESS) {
              return gamePk;
            }
          }
        );
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
    // let inProgress: boolean;
    // let recentPlays: Record<string, any> =
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
