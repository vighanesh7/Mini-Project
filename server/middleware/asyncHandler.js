// Express 4 does not catch errors thrown inside async functions.
// This wrapper sends them to the central error handler via next(err).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
