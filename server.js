const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// config dotenv
require('dotenv').config({
  path: './config/config.env'
});

const app = express();

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
    msg: 'Page not founded'
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
