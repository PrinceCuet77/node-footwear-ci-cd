import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default to 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Default to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'ERROR',
    error: 'Too many requests, please try again later.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // Default to 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10), // Default to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'ERROR',
    error: 'Too many attempts, please try again later.',
  },
});

export default rateLimiter;
