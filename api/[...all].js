// Vercel serverless entry point. The filename `[...all].js` is Vercel's
// catch-all route convention — every request under /api/* is dispatched to
// this function, which just hands it to the same Express app used for
// local development (server/index.js). Express does its own internal
// routing against the real request path, so no rewrite/path-stripping is
// needed here.
export { default } from '../server/index.js';
