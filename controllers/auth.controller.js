const User = require('../models/auth.model');

const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const _ = require('lodash');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const sgMail = require('@sendgrid/mail');

const { errorHandler } = require('../helpers/dbErrorHandling');

sgMail.setApiKey(process.env.MAIL_KEY);

exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    User.findOne({ email }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          errors: 'Email is taken'
        });
      }
    });

    // generate token
    const token = jwt.sign(
      {
        name,
        email,
        password
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: '15m'
      }
    );

    // email template
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Account activation link',
      html: `
              <h1>Please use the following to activate your account</h1>
              <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
              <hr />
              <p>This email may containe sensitive information.</p>
              <p>${process.env.CLIENT_URL}</p>
            `
    };

    // send email
    sgMail
      .send(emailData)
      .then((sent) => {
        return res.json({
          message: `Email has been sent to ${email}`
        });
      })
      .catch((err) => {
        return res.status(400).json({
          success: false,
          errors: errorHandler(err)
        });
      });
  }
};

exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    // verify token if expired, valid or invalid
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        console.log('Activation error');
        return res.status(401).json({
          errors: 'Link Expired. Signup again.'
        });
      } else {
        const { name, email, password } = jwt.decode(token);

        const user = new User({
          name,
          email,
          password
        });

        // save user to database
        user.save((err, user) => {
          if (err) {
            console.log('Error in saving user', errorHandler(err));
            return res.status(401).json({
              errors: errorHandler(err)
            });
          } else {
            return res.json({
              success: true,
              message: 'Signup success',
              user
            });
          }
        });
      }
    });
  } else {
    return res.json({
      message: 'Error occurred. Please try again.'
    });
  }
};
