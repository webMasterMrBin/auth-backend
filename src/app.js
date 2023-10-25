const express = require('express');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const qs = require('qs');
const axios = require('axios');
const chalk = require('chalk');
const api = require('./api');
const initSession = require('./session');
const { apiAuth } = require('./api/middleware');
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(cookieParser());

const isDev = process.env.NODE_ENV == 'DEV';

// 开发环境模拟网络delay
if (isDev) {
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

  // github OAuth callbak
  app.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (code) {
      /* get git token */
      const { data } = await axios
        .post('https://github.com/login/oauth/access_token', {
          code,
          client_id: isDev && '5da64e99978d1a198b9d',
          client_secret: isDev && 'e387adb9dea304393e4a975a546b09b136dfef22',
        })
        .catch(err => {
          console.log(chalk.red(err));
          res.json({ message: 'github OAuth app login error', status: 0 });
          return {};
        });

      if (data) {
        const { access_token } = qs.parse(data);
        // TODO cookie保存git token 校验github 有效期
        /* get git account info */
        const { data: userData } = await axios('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }).catch(err => {
          console.log(chalk.red(err));
          return {};
        });
        console.log('userData', userData);

        if (userData) {
          // TODO mongodb存git账户信息
          /* 会话信息中保存git账户登录信息 */
          req.session.username = userData.login;
          req.session.isGithub = true;

          res.redirect('/chatroom');
          return;
        }
        // git token失效
        res.redirect('/login');
      }

      return;
    }

    res.redirect('/login');
  });

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
