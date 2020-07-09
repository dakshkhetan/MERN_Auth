const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// config dotenv
require('dotenv').config({
  path: './config/config.env'
});

// connect to database
connectDB();

app.use(bodyParser.json());

const authRouter = require('./routes/auth.route');

// dev middleware
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: process.env.CLIENT_URL
    })
  );
  app.use(morgan('dev'));
}

app.use('/api', authRouter);

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
