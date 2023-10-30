const { apiAuth } = require('./middleware');

module.exports = (app, { redisStore }) => {
  app.get('/api/loginUsers', apiAuth, (req, res) => {
    redisStore.all((err, sessions) => {
      if (err) {
        res.status(500).json({ message: 'something wrong', status: 0 });
        return;
      }

      res.json({ data: sessions.map(v => ({ username: v.username, id: v.id })), status: 1 });
    });
  });
};
