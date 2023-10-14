const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const api = require('./api');
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

/** 会话管理保存用户登录信息 */
app.use(
  session({
    secret: 'auth-backend',
    // 每次请求不更新maxAge
    rolling: false,
    resave: false,
    // 空的会话内容不保存 即需要手动设置sesson值 req.session = xxx
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  }),
);

// 开发环境模拟网络delay
if (process.env.NODE_ENV == 'DEV') {
  app.use('/api', async (req, res, next) => {
    // 每个请求模拟 100ms延时
    const delay = 100;
    await new Promise(res => {
      setTimeout(() => res(), delay);
    });

    next();
  });
}

api(app);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`auth Server listening at http://127.0.0.1:${port}`);
});
