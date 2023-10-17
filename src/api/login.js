const jwt = require('jsonwebtoken');
const chalk = require('chalk');
const { JWT_SECRET_KEY, LOGIN_MAXAGE } = require('../config');
const userDb = require('../db');
const { apiAuth, limiter, limitSessionCount } = require('./middleware');

module.exports = (app, { redisStore }) => {
  app.get('/api/test', apiAuth, (req, res) => {
    res.json({ message: '登录状态有效!', status: 1 });
  });

  app.post('/api/login', limiter, limitSessionCount(redisStore), async (req, res) => {
    const token = req.headers.authorization?.split(' ')?.[1];
    const { username, password } = req.body;

    const login = async () => {
      /* 连接数据库&检查用户名/密码有效 */
      const User = await userDb();
      // 用户名/密码是否有效
      const _id = await User.exists({ username, password }).catch(err => {
        console.log(chalk.red(err));
        res.status(500).json({ message: 'something wrong! please connect admin', status: 0 });
      });

      /** 账户有效下发token */
      if (_id) {
        const token = jwt.sign(req.body, JWT_SECRET_KEY, { expiresIn: `${LOGIN_MAXAGE}` });
        // token存在cookie发给client
        res.cookie('token', token, { maxAge: LOGIN_MAXAGE });
        // 保存登录会话
        req.session.username = username;

        res.json({ message: 'login success', status: 1 });
      } else {
        // 用户名/密码无效
        res.json({ message: 'login faild', status: 0 });
      }
    };

    // 未登录系统不含token 进行token下发操作
    if (!token) {
      login();

      return;
    }

    /** 登录过系统有有效的token 继续调用登录逻辑 */
    jwt.verify(token, JWT_SECRET_KEY, err => {
      // token无效下发更新新的token给客户端
      if (err) {
        login();
        return;
      }

      res.json({ message: 'login success', status: 1 });
    });
  });
};
