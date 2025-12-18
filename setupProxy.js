const { createProxyMiddleware } = require('http-proxy-middleware');


module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      target: 'https://api.usdiary.site', // 프록시할 서버 URL
      changeOrigin: true,
      pathRewrite: {
        '^': '', // 모든 URL을 그대로 전달
      },
    })
  );
};
