import serverless from 'serverless-http';
import app from '../../src/app.js';

const handler = serverless(app);

export default function (req, res) {
  try {
    if (typeof req.url === 'string') {
      if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url === '/' ? '' : req.url);
      }
    }
  } catch (e) {
    // ignore
  }
  return handler(req, res);
}


