const session = require('express-session');
const { LOGIN_MAXAGE, SESSION_SECRET_KEY } = require('./config');
const RedisStore = require("connect-redis").default;
const { createClient } = require('redis');

/** 会话管理保存用户登录信息 */
module.exports = async app => {
  const redisClient = await createClient({
    database: 0,
  }).connect().catch(console.error);

  console.log('isready', redisClient.isReady);
  redisClient.on('connect', () => {
    console.log('redis connect !')
  });

  redisClient.on('err', () => {
    console.log('redis err connect !')
  });

  const redisStore = new RedisStore({
    client: redisClient,
    ttl: LOGIN_MAXAGE,
  })

  app.use(
    session({
      // store: redisStore,
      secret: SESSION_SECRET_KEY,
      // 每次请求不更新maxAge
      rolling: false,
      resave: false,
      // 空的会话内容不保存 即需要手动设置sesson值 req.session = xxx
      saveUninitialized: false,
      cookie: {
        maxAge: LOGIN_MAXAGE,
        httpOnly: true,
      },
    })
  );

  return redisStore;
};