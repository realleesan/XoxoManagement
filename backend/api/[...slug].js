import serverless from 'serverless-http';
import app from '../src/app.js';

// Catch-all serverless handler to forward all /api/* requests to Express app
// Vercel routes to this file with the path after /api, so we need to
// prefix '/api' back to req.url before forwarding to the Express app.
const handler = serverless(app);

export default function (req, res) {
  try {
    // Ensure request URL has '/api' prefix so Express routes like '/api/auth' match
    if (typeof req.url === 'string') {
      if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url === '/' ? '' : req.url);
      }
    }
  } catch (e) {
    // ignore and continue
  }
  return handler(req, res);
}


