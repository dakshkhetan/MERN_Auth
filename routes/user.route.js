const express = require('express');
const router = express.Router();

const {
  requireSignin,
} = require('../controllers/auth.controller');

const {
  readController,
} = require('../controllers/user.controller');

router.get('/user/:id', requireSignin, readController);

module.exports = router;
