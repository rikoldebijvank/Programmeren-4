const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/user.routes');
const mealRouter = require('./src/routes/meal.routes');
const authRouter = require('./src/routes/auth.routes');
const logger = require('./src/util/utils').logger;
const port = process.env.PORT || 3000;
require('dotenv').config();
app.use(bodyParser.json());

app.use('*', (req, res, next) => {
  const method = req.method;
  logger.info(`Methode ${method}`)
  next();
});

// UC-102
app.get('/api/info', (req, res) => {
  logger.info(`Info endpoint called`)
  res.status(200).json(
    {
      status: 200,
      message: 'Server info-endpoint',
      data: {
        studentName: 'Rik Olde Bijvank',
        studentNumber: 2202811,
        description: 'Welkom bij de server API van de share a meal app.'
      }
    }
  );
});

app.use('/api/user', userRouter);
app.use('/api/meal', mealRouter);
app.use('/api', authRouter);

app.use('*', (req, res) => {
  logger.info(`Endpoint not found`)
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {}
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.info(`Error handler called`)
  res.status(err.status).json(err);
});

app.listen(port, () => {
  logger.info(`App listening on port ${port}`)
});

module.exports = app;
