const register = require('./register');
const login = require('./login');
const logout = require('./logout');
const captcha = require('./captcha');

module.exports = (app, options) => {
  register(app, options);
  login(app, options);
  logout(app, options);
  captcha(app, options);
};
