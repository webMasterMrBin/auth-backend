const express = require('express');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const api = require('./api');
const initSession = require('./session');
const { apiAuth } = require('./api/middleware');
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(cookieParser());

// 开发环境模拟网络delay
if (process.env.NODE_ENV == 'DEV') {
  app.use('/api', async (req, res, next) => {
    // 每个请求模拟 100ms延时
    const delay = 500;
    await new Promise(res => {
      setTimeout(() => res(), delay);
    });

    next();
  });
}

initSession(app).then(redisStore => {
  api(app, { redisStore });

  app.get('*', apiAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/main.html'));
  });
});

// 启动服务器
// https
//   .createServer(
//     {
//       key: fs.readFileSync(path.join(__dirname, '../private.key')),
//       cert: fs.readFileSync(path.join(__dirname, '../certificate.crt')),
//     },
//     app,
//   )
//   .listen(port, () => {
//     console.log(`auth Server listening at https://127.0.0.1:${port}`);
//   });
app.listen(port, () => {
  console.log(`auth Server listening at http://127.0.0.1:${port}`);
});
