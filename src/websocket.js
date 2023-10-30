const WebSocket = require('ws');

module.exports = () => {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws, req) => {
    // 身份验证登录系统可用ws
    if (req.session.username) {
      ws.on('error', err => {
        console.log('ws error1', err);
        ws.close();
      });

      ws.on('message', data => {
        console.log('data', data);
        console.log('wss.clients.size', wss.clients.size);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                username: req.session.username,
                data: JSON.parse(data.toString()),
              }),
            );
          }
        });
      });
    }

    // ws.send('something');
  });

  return wss;
};
