const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// config .env
require('dotenv').config({
  path: './config/config.env'
});

// connect to database
connectDB();

app.use(bodyParser.json());

// dev middleware
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: process.env.CLIENT_URL
    })
  );
  app.use(morgan('dev'));
}

const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');

app.use('/api', authRouter);
app.use('/api', userRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
