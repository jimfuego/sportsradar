/**
 * @file index.ts
 *
 * For the sake of time, both the scheduler and server are located in this file.
 */
import express from 'express';
import cron from 'node-cron';
import ScheduleService from './services/schedule-service';
import { GamePool } from './utils/gameTracker';

let gameTracker = new GamePool();
gameTracker.addGame('2022010074');

const app = express();
app.use(express.json());
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
const cronIntervalSeconds = '30'; //seconds
const cronJob = cron.schedule(
  `*/${cronIntervalSeconds} * * * * *`, // run every (x) seconds
  async () => {
    await ScheduleService.getLiveGames().then((newGames) => {
      gameTracker.addGames(newGames);
    });
    liveJobTrigger();
  },
  { scheduled: false }
);

/**
 * Job that runs when games are live, (i.e. when gameTracker.isActive())
 * Up to the minute updates for live games!
 */
const liveUpdatesJob = cron.schedule(
  `*/${1} * * * * *`,
  async () => {
    gameTracker.getUpdates();
  },
  { scheduled: true }
);

/**
 * job that runs less frequently to merge data from failed_calls_bronze
 * table and game_data_bronze table into game_data_silver table
 */
const silverJob = cron.schedule(
  `* 0 * * * *`, // run at midnight
  async () => {}
);

/**
 * Util function to trigger the appropriate behavior of liveUpdatesJob
 */
const liveJobTrigger = () => {
  if (gameTracker.isActive()) {
    console.log('GameTracker is active!');
    liveUpdatesJob.start();
  } else {
    console.log('GameTracker is sleeping!');
    liveUpdatesJob.stop();
  }
};

// for testing purposes
export { server, app, cronJob, liveUpdatesJob, silverJob };
