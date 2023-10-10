const chalk = require('chalk');
const userDb = require('../db');

module.exports = app => {
  app.post('/api/register', async (req, res) => {
    const resSendError = () => {
      res.status(500).json({ message: 'something wrong! please connect admin', status: 0 });
    };

    const { username, password } = req.body;
    const User = await userDb();

    // 用户名不存在则创建新用户名
    const result = await User.create({ username, password }).catch(error => {
      console.log(chalk.red(`Failed to insert document: ${error}`));
      resSendError();
    });
    // 插入数据库成功
    if (result) {
      console.log(chalk.green(`user ${result} insert success!`));
      res.json({ message: 'register success', status: 1 });
    }
  });
};
