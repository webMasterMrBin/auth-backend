const qs = require('qs');
const axios = require('axios');
const chalk = require('chalk');
const { LOGIN_MAXAGE, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../config');

module.exports = app => {
  const isDev = process.env.NODE_ENV == 'DEV';
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
          req.session.avatar = userData.avatar_url;

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
};
