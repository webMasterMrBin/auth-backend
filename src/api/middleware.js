const jwt = require('jsonwebtoken');
const SECRET_KEY = require('./secretkey');

const apiAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')?.[1];

  jwt.verify(token, SECRET_KEY, err => {
    if (err) {
      res.status(500).json({ message: 'token is inValid! please re-login', status: 0 });
      return;
    }

    next();
  });
};

module.exports = { apiAuth };
