const User = require('../models/user.model');

exports.readController = (req, res) => {
  const userId = req.params.id;

  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    // hide sensitive user data
    user.hashed_password = undefined;
    user.salt = undefined;

    return res.json(user);
  });
};

exports.updateController = (req, res) => {
  console.log('USER OLD DATA', req.user, 'UPDATE DATA', req.body);
  const { name, password } = req.body;

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    if (!name) {
      return res.status(400).json({
        error: 'Name is required'
      });
    } else {
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password should be min 6 characters long'
        });
      } else {
        user.password = password;
      }
    }

    // save user with updated data in database
    user.save((err, updatedUser) => {
      if (err) {
        console.log('USER UPDATE ERROR', err.message);
        return res.status(400).json({
          error: 'User update failed'
        });
      }

      // hide sensitive user data
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;

      return res.json(updatedUser);
    });
  });
};
