const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY, GITHUB_CLIENT_ID, GITHUB_AUTH_TOKEN } = require('../config');
const { rateLimit } = require('express-rate-limit');
const axios = require('axios');
const chalk = require('chalk');

/** ip请求限制 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.', status: 0 },
});

/** 身份认证 */
const apiAuth = async (req, res, next) => {
  const { token } = req.cookies;
  const { githubId } = req.session;

  if (githubId) {
    // TODO github Oauth token有效期 默认git token永久有效
    // gittoken 在登录会话有效期内永久有效 如果过了系统有效期则 跳转登录页
    // git token失效 清理登录信息
    // res.redirect('/login');
    next();
    return;
  }

  jwt.verify(token, JWT_SECRET_KEY, err => {
    const isLogin = req.path === '/login';

    if (err || !token) {
      if (!isLogin) {
        res.redirect('/login');
        return;
      }

      next();
      // res.status(500).json({ message: 'token is inValid! please re-login', status: 0 });
      // return;
    } else {
      if (isLogin) {
        res.send('已登录');
        return;
      }

      next();
    }
  });
};

/** 相同用户名的登录状态session存储数量上限(for 登录设备数量上限) */
const limitSessionCount = redisStore => async (req, res, next) => {
  const { username } = req.session;

  redisStore.all((err, sessions) => {
    if (err) {
      res.status(500).json({ message: 'something wrong', status: 0 });
      return;
    }

    // 当同一用户登录状态大于等于3时提示登录失败
    const isLimitSession = sessions.filter(session => session.username === username).length >= 3;
    if (isLimitSession) {
      res
        .status(500)
        .json({ message: 'This account is logged into too many devices, please confirm and try again.', status: 0 });
      return;
    }
    next();
  });
};

module.exports = { apiAuth, limiter, limitSessionCount };
