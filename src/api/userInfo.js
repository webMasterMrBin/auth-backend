const { apiAuth } = require('./middleware');

module.exports = app => {
  app.get('/api/userInfo', apiAuth, (req, res) => {
    res.json({ data: req.session.username, status: 0 });
  });
};
