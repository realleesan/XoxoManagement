import serverless from 'serverless-http';
import app from '../src/app.js';

// Export a serverless handler for Vercel functions
export default serverless(app);


