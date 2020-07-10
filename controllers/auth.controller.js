const User = require('../models/auth.model');

const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const _ = require('lodash');
const { validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail');
const { OAuth2Client } = require('google-auth-library');

const { errorHandler } = require('../helpers/dbErrorHandling');

sgMail.setApiKey(process.env.MAIL_KEY);

exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } else {
    User.findOne({ email }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          error: 'Email already registered with some user.'
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
          error: errorHandler(err)
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
        console.log('Account activation error', err.message);
        return res.status(401).json({
          error: 'Link Expired. Signup again.'
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
              error: errorHandler(err)
            });
          } else {
            return res.json({
              success: true,
              message: 'Signup successful',
              user
            });
          }
        });
      }
    });
  } else {
    return res.status(401).json({
      error: 'Invalid link!'
    });
  }
};

exports.signinController = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } else {
    // check if user exist
    User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'User with that email does not exist. Please sign-up first.'
        });
      }
      // check authentication
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: 'Incorrect email or password.'
        });
      }
      // generate token & send to client
      const token = jwt.sign(
        {
          _id: user._id
        },
        process.env.JWT_SECRET,
        {
          // set it to 30d for 'remember me' feature (if present)
          expiresIn: '7d'
        }
      );

      const { _id, name, email, role } = user;
      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role
        }
      });
    });
  }
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
  // the decoded JWT payload is available on the request via 'user' property
  // i.e. we can access authenticated user data, eg: 'req.user._id'
});

exports.forgotPasswordController = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } else {
    User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'User with that email does not exist.'
        });
      }
      // generate token
      const token = jwt.sign(
        {
          _id: user._id
        },
        process.env.JWT_RESET_PASSWORD,
        {
          expiresIn: '10m'
        }
      );
      // email template
      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Password Reset link`,
        html: `
                <h1>Please use the following link to reset your password:</h1>
                <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information.</p>
                <p>${process.env.CLIENT_URL}</p>
              `
      };

      return user.updateOne(
        {
          resetPasswordToken: token
        },
        (err, success) => {
          if (err) {
            console.log('RESET PASSWORD LINK ERROR', err.message);
            return res.status(400).json({
              error:
                'Database connection error on sending request. Try again later.'
            });
          } else {
            sgMail
              .send(emailData)
              .then((sent) => {
                // console.log('PASSWORD RESET EMAIL SENT', sent);
                return res.json({
                  message: `Email has been sent to ${email}. Follow the instructions to activate your account.`
                });
              })
              .catch((err) => {
                console.log('SIGNUP EMAIL SENT ERROR', err.message);
                return res.status(400).json({
                  error: err.message
                });
              });
          }
        }
      );
    });
  }
};

exports.resetPasswordController = (req, res) => {
  const { newPassword, resetPasswordToken } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } else {
    if (resetPasswordToken) {
      // verify token
      jwt.verify(
        resetPasswordToken,
        process.env.JWT_RESET_PASSWORD,
        (err, decoded) => {
          if (err) {
            return res.status(400).json({
              error: 'Password reset link expired.'
            });
          }

          User.findOne({ resetPasswordToken }, (err, user) => {
            if (err || !user) {
              return res.status(400).json({
                error: 'Something went wrong. Try again later.'
              });
            }

            const updatedFields = {
              password: newPassword,
              resetPasswordToken: ''
            };

            // update 'user' object with new/updated data fields
            user = _.extend(user, updatedFields);

            // save updated user in database
            user.save((err, userData) => {
              if (err) {
                return res.status(400).json({
                  error: 'Error resetting user password.'
                });
              }

              return res.json({
                message: `Password reset successful!`
              });
            });
          });
        }
      );
    }
  }
};

// sign-in with Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleController = (req, res) => {
  const { idToken } = req.body;

  // verify token
  client
    .verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    .then((response) => {
      console.log('GOOGLE LOGIN RESPONSE', response);
      const { email_verified, name, email } = response.payload;

      // check if email is verified
      if (email_verified) {
        // check if email already exists in database
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            // generate token
            const token = jwt.sign(
              {
                _id: user._id
              },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            const { _id, email, name, role } = user;
            // send token & user data as response to client
            return res.json({
              token,
              user: {
                _id,
                email,
                name,
                role
              }
            });
          } else {
            // generate password for user
            let password = email + process.env.JWT_SECRET;
            // create user with credentials
            user = new User({ name, email, password });
            // save user in database
            user.save((err, savedUser) => {
              if (err) {
                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err.message);
                return res.status(400).json({
                  error: 'User sign-up failed with Google.'
                });
              }

              // generate token
              const token = jwt.sign(
                { _id: savedUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
              );

              const { _id, email, name, role } = savedUser;
              // send token & user data as response to client
              return res.json({
                token,
                user: {
                  _id,
                  email,
                  name,
                  role
                }
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: 'Sign-in with Google failed. Try again.'
        });
      }
    });
};

exports.facebookController = (req, res) => {
  const { userID, accessToken } = req.body;

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

  return (
    fetch(url, { method: 'GET' })
      .then((response) => response.json())
      // .then(response => console.log(response))
      .then((response) => {
        console.log(response);
        const { email, name } = response;

        // check if email already exists in database
        User.findOne({ email }).exec((err, user) => {
          // user with that email already exists in database
          if (user) {
            // generate token
            const token = jwt.sign(
              {
                _id: user._id
              },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            const { _id, email, name, role } = user;
            // send token & user data as response to client
            return res.json({
              token,
              user: {
                _id,
                email,
                name,
                role
              }
            });
          }
          // user does not exist with that email in database
          else {
            // generate password for user
            let password = email + process.env.JWT_SECRET;
            // create user with credentials
            user = new User({ name, email, password });
            // save user in database
            user.save((err, savedUser) => {
              if (err) {
                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err.message);
                return res.status(400).json({
                  error: 'User sign-up failed with Facebook.'
                });
              }

              // generate token
              const token = jwt.sign(
                { _id: savedUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
              );

              const { _id, email, name, role } = savedUser;
              // send token & user data as response to client
              return res.json({
                token,
                user: {
                  _id,
                  email,
                  name,
                  role
                }
              });
            });
          }
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: 'Sign-in with Facebook failed. Try again.'
        });
      })
  );
};
