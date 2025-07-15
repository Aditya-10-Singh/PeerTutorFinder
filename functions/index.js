const functions = require('firebase-functions');
const next = require('next');

const dev = false; // since you are deploying
const app = next({
  dev,
  conf: { distDir: '.next' },
});
const handle = app.getRequestHandler();

exports.nextjsServer = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
