const register = require('./register');
const login = require('./login');

module.exports = app => {
  register(app);
  login(app);
};
