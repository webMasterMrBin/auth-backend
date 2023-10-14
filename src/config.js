const JWT_SECRET_KEY = 'lgoinSecretKey';
const SESSION_SECRET_KEY = 'sessionAuthBackend';
// token有效期 和 session登录会话有效期为同一个
const LOGIN_MAXAGE = 1000 * 60;

module.exports = {
  JWT_SECRET_KEY,
  SESSION_SECRET_KEY,
  LOGIN_MAXAGE,
};
