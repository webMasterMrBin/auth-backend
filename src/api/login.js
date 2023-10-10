const jwt = require('jsonwebtoken');
const chalk = require('chalk');
const userDb = require('../db');
const SECRET_KEY = require('./secretkey');
const { apiAuth } = require('./middleware');

module.exports = app => {
  app.get('/api/test', apiAuth, (req, res) => {
    res.json({ message: '登录状态有效!', status: 1 });
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const User = await userDb();

    // 用户名/密码是否有效
    const _id = await User.exists({ username, password }).catch(err => {
      console.log(chalk.red(err));
      res.status(500).json({ message: 'something wrong! please connect admin', status: 0 });
    });

    if (_id) {
      const token = jwt.sign(req.body, SECRET_KEY, { expiresIn: 60 });
      // 10分钟
      res.cookie('token', token, { maxAge: 1000 * 60 });

      res.json({ message: 'login success', status: 1 });
    } else {
      // 用户名/密码无效
      res.json({ message: 'login faild', status: 0 });
    }
  });
};
