const express = require('express');
const router = express.Router();

const {
  signinController,
  registerController,
  activationController
} = require('../controllers/auth.controller');

const {
  validSign,
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../helpers/valid');

router.post('/login', validLogin, signinController);
router.post('/register', validSign, registerController);
router.post('/activation', activationController);

module.exports = router;
