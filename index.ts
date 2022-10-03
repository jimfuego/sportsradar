import express from 'express';

const app = express();
app.use(express.json());
const PORT = process.env.PORT;
app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Running Node with Express and Typescript',
  });
});
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}.`);
});

export default app;
