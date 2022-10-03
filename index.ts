import express from 'express';
import cron from 'node-cron';

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

const cronIntervalSeconds = '30'; //seconds
const cronJob = cron.schedule(`*/${cronIntervalSeconds} * * * * *`, () => {
  console.log(`running a task every ${cronIntervalSeconds} seconds`);
});

export { server, app, cronJob };
