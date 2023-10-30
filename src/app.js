const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const path = require('path');
const api = require('./api');
const initSession = require('./session');
const initWsServer = require('./websocket');
const { apiAuth } = require('./api/middleware');
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

initSession(app).then(({ redisStore, sessionParser }) => {
  api(app, { redisStore });

  app.get('*', apiAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/main.html'));
  });

  const httpServer = http.createServer(app);
  httpServer.listen(port, () => {
    console.log(`auth Server listening at http://127.0.0.1:${port}`);
  });

  const wss = initWsServer(httpServer);

  /* use req.session in websocket */
  httpServer.on('upgrade', (request, socket, head) => {
    sessionParser(request, {}, () => {
      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit('connection', ws, request);
      });
    });
  });
});

// 启动https
// https
//   .createServer(
//     {
//       key: fs.readFileSync(path.join(__dirname, '../private.key')),
//       cert: fs.readFileSync(path.join(__dirname, '../certificate.crt')),
//     },
//     app,
//   )


