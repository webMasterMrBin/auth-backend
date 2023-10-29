const express = require('express');
const https = require('https');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const path = require('path');
const qs = require('qs');
const axios = require('axios');
const chalk = require('chalk');
const api = require('./api');
const initSession = require('./session');
const { apiAuth } = require('./api/middleware');
const { LOGIN_MAXAGE, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('./config');
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(cookieParser());

const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, '../log'),
});

app.use(morgan('combined', { stream: accessLogStream }));

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
  app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;

    if (code) {
      /* get git token */
      const { data } = await axios
        .post('https://github.com/login/oauth/access_token', {
          code,
          client_id: isDev && GITHUB_CLIENT_ID,
          client_secret: isDev && GITHUB_CLIENT_SECRET,
        })
        .catch(err => {
          console.log(chalk.red(err));
          res.json({ message: 'github OAuth app login error', status: 0 });
          return {};
        });

      if (data) {
        const { access_token } = qs.parse(data);
        /* get git account info */
        const { data: userData } = await axios
          .get('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .catch(err => {
            console.log(chalk.red(err));
            return {};
          });

        if (userData?.login) {
          // TODO mongodb存git账户信息
          /* 会话信息中保存git账户登录信息 */
          req.session.username = userData.login;
          req.session.githubId = userData.id;

          res.cookie('token', access_token, { maxAge: LOGIN_MAXAGE, httpOnly: true });

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
