const express = require('express');

// config dotenv
require('dotenv').config({
  path: './config/config.env'
});

const app = express();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
