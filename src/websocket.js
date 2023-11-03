const WebSocket = require('ws');

module.exports = () => {
  const wss = new WebSocket.Server({ noServer: true });

  const loginUsers = [];

  wss.on('connection', (ws, req) => {
    const sessionId = req.session.id || req.session.githubId;

    if (sessionId) {
      loginUsers.push({
        username: req.session.username,
        avatar: req.session.avatar || '',
        id: sessionId,
      });
    }

    console.log('connection join loginusers', loginUsers);

    // console.log('loginUsers', loginUsers);
    // 身份验证登录系统可用ws
    if (req.session.username) {
      ws.on('error', err => {
        console.log('ws error1', err);
        ws.close();
      });

      ws.on('message', data => {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            console.log('server收到消息');
            const { type, content } = JSON.parse(data.toString());

            if (type === 'login') {
              client.send(
                JSON.stringify({
                  type: 'login',
                  usersCount: wss.clients.size,
                  loginUsers,
                  username: req.session.username,
                }),
              );
            }

            if (type === 'chat') {
              client.send(
                JSON.stringify({
                  type: 'chat',
                  username: req.session.username,
                  content,
                }),
              );
            }
          }
        });
      });

      ws.on('close', () => {
        console.log('server cloese');

        if (sessionId) {
          loginUsers.splice(
            loginUsers.findIndex(v => v.id === sessionId),
            1,
          );
        }

        // console.log('close loginUsers', loginUsers);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: 'logout',
                usersCount: wss.clients.size,
                loginUsers,
                username: req.session.username,
              }),
            );
          }
        });
      });
    }
  });

  return wss;
};
