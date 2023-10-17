const svgCaptcha = require('svg-captcha');

module.exports = app => {
  app.get('/api/captcha', (req, res) => {
    const { data, text } = svgCaptcha.create();
    res.json({ svg: data, text });
  });
};
