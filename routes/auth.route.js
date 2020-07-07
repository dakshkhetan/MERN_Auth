const express = require('express');
const router = express.Router();

const { registerController } = require('../controllers/auth.controller');

const {
  validSign,
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../helpers/valid');

router.post('/register', validSign, registerController);

module.exports = router;
