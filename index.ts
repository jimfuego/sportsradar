/**
 * @file index.ts
 *
 * For the sake of time, both the scheduler and server are located in this file.
 */
import express from 'express';
import cron from 'node-cron';
import ScheduleService from './services/schedule-service';
import { GamePool } from './utils/gameTracker';
import bronze from './routes/bronze';
import { createBronzeTable } from './services/sql-service';

const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

// setup sqlite db
createBronzeTable();
// delay so db can initialize
// sleep(500).then(() => seedBronzeTable())

let gameTracker = new GamePool();

const app = express();
app.use(express.json());
app.use('/api/v1/app/bronze', bronze);

const PORT = process.env.PORT;

// say hello
app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Hello, there!',
  });
});

// start server
const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}.`);
});

// Main job monitors for newly started games
// Probably run this every 5-10 minutes in "prod"

const cronIntervalSeconds = '5';
const cronJob = cron.schedule(
  `*/${cronIntervalSeconds} * * * * *`,
  async () => {
    await ScheduleService.getLiveGames().then((newGames) => {
      /* Switch the two lines below to test the scheduler on historical data
        Note: in "history-mode"
      */
      gameTracker.addGames(['2022010085']); //comment me in
      // gameTracker.addGames(newGames); // comment me out
    });
    liveJobTrigger();
  },
  { scheduled: true }
);

/**
 * Job that runs when games are live, (i.e. when gameTracker.isActive())
 * Up to the minute updates for live games!
 */
const liveUpdatesJob = cron.schedule(
  `*/${10} * * * * *`,
  async () => {
    gameTracker.getUpdates();
  },
  { scheduled: false }
);

/**
 * job that runs less frequently to merge data from failed_calls_bronze
 * table and game_data_bronze table into game_data_silver table
 */
const silverJob = cron.schedule(`* 0 * * * *`, async () => {});

/**
 * Util function to trigger the appropriate behavior of liveUpdatesJob
 */
const liveJobTrigger = () => {
  if (gameTracker.isActive()) {
    console.log('GameTracker is active!');
    console.log('Tracking:', gameTracker._activeGames);
    liveUpdatesJob.start();
  } else {
    console.log('GameTracker is sleeping!');
    liveUpdatesJob.stop();
  }
};

// for testing purposes
export { server, app, cronJob, liveUpdatesJob, silverJob };
