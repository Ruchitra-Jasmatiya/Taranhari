// The ONE serverless function behind every /api/* URL.
// vercel.json rewrites /api/* here, and server/app.js does the real routing from the original URL.
import handler from '../server/app.js';

export default handler;
export const config = { maxDuration: 15 };
