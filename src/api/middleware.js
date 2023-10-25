const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../config');
const { rateLimit } = require('express-rate-limit');

/** ip请求限制 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.', status: 0 },
});

/** 身份认证 */
const apiAuth = (req, res, next) => {
  const { token } = req.cookies;
  const { isGithub } = req.session;
  console.log('isGithub', isGithub);
  // TODO github Oauth token有效期
  if (!isGithub) {
    jwt.verify(token, JWT_SECRET_KEY, err => {
      const isLogin = req.path === '/login';

      if (err || !token) {
        if (!isLogin) {
          res.redirect('/login');
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

    return;
  }

  next();
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
