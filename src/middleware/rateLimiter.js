const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true,
});

const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many posts created, please try again later",
});

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many comments, please try again later",
});

module.exports = { limiter, strictLimiter, postLimiter, commentLimiter };
