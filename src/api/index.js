const register = require('./register');
const login = require('./login');
const logout = require('./logout');
const captcha = require('./captcha');
const userInfo = require('./userInfo');
const githubOAuth = require('./githubOAuth');

module.exports = (app, options) => {
  register(app, options);
  login(app, options);
  logout(app, options);
  captcha(app, options);
  userInfo(app, options);
  githubOAuth(app, options);
};
