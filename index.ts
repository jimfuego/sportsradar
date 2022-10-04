import express from 'express';
import cron from 'node-cron';
// import ScheduleService from './services/schedule';
import ILiveData from './types/live-data';

let liveGames: Set<string> = new Set();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Hello, there!',
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}.`);
});

let x = 0;

const cronIntervalSeconds = '3'; //seconds
console.log(`running a task every ${cronIntervalSeconds} seconds`);
const testfn = (x: number) => {
  if (x % 2 === 0) { // TODO: are there live games
    liveUpdatesJob.start();
  } else {
    liveUpdatesJob.stop();
  }
}
// Main job monitors for newly started games
const cronJob = cron.schedule(
  `*/${cronIntervalSeconds} * * * * *`, // run every (x) seconds
  async () => {
    console.log('---------')
    console.log('run', x);
    console.log('---------')
    testfn(x);

    if (liveGames.size > 0) {
      // ScheduleService
      //   .getNewLiveGames(liveGames)
      //   .then(newGames => {
      //     liveGames = new Set([...liveGames, ...newGames])
      //   });
    } else {

    }
    x++;
  }
);
let z = 0;
// second job that runs when games are live, (i.e. when liveGames.size > 0)
const liveUpdatesJob = cron.schedule(
  `*/${1} * * * * *`, // run every (x) seconds
  async () => {
    worker(z)
    z++;
  },
  { scheduled: false }
)

// job that runs less frequently to merge data from failed_calls_bronze table and game_data_bronze table into game_data_silver table
const silverJob = cron.schedule(
  `* 0 * * * *`, // run at midnight
  async () => {

  }
)

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function worker(z: number) {
  let i: number = 0;
  let keepGoing: boolean = true;
  while (keepGoing) {
    console.log(`${z}w:`, i)
    await delay(6000); //to the minute updates
    i++;
    if (i === 3) keepGoing = false;
  }
  console.log(`worker ${z} closed!!!`)
}


async function getGameStats(gameId: string) {
  let gameIsLive: boolean = true;
  while (gameIsLive) {
    console.log(gameId)
    await delay(3000);
    if (true) gameIsLive = false;
  }
}



export { server, app, cronJob, silverJob };
