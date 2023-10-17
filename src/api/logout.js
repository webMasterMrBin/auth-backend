const { apiAuth } = require('./middleware');

module.exports = (app, { redisStore }) => {
  app.post('/api/logout', apiAuth, (req, res) => {
    res.clearCookie('token');
    res.clearCookie('connect.sid');

    redisStore.destroy(req.session.id, err => {
      if (err) {
        res.status(500).json({ message: 'something wrong', status: 0 });
        return;
      }

      res.json({ message: 'logout success', status: 1 });
    });
  });
};
