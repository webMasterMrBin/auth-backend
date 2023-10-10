const express = require('express');
const app = express();
const path = require('path');
const api = require('./api');
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
// 开发环境模拟网络delay
if (process.env.NODE_ENV == 'DEV') {
  app.use(async (req, res, next) => {
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
