const User = require('../models/auth.model');

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
