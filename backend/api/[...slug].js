import serverless from 'serverless-http';
import app from '../src/app.js';

// Catch-all serverless handler to forward all /api/* requests to Express app
export default serverless(app);


