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
  const token = req.headers.authorization?.split(' ')?.[1];

  jwt.verify(token, JWT_SECRET_KEY, err => {
    if (err) {
      res.status(500).json({ message: 'token is inValid! please re-login', status: 0 });
      return;
    }

    next();
  });
};

module.exports = { apiAuth, limiter };
