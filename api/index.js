// Vercel serverless entry point. vercel.json explicitly rewrites every
// /api/* request to this function (relying on the filesystem `[...all]`
// catch-all convention alone turned out to only match a single path
// segment on Vercel — /api/stocking worked but /api/stocking/:id and
// /api/alterations/:kind did not). Express does its own internal routing
// against the real, unmodified request path, so no path-stripping is
// needed here.
export { default } from '../server/index.js';
