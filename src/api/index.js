const register = require('./register');
const login = require('./login');

module.exports = (app, options) => {
  register(app, options);
  login(app, options);
};
