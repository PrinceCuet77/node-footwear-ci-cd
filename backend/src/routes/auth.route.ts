import { Router } from 'express';
import {
  getNewRefreshToken,
  getNewRefreshTokenFromBody,
  login,
  logout,
  register,
} from '@controllers/auth.controller';
import { verifyToken } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/zodValidate';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from '@validators/auth.validator';
import { authRateLimiter } from '@middlewares/rateLimiter.middleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post(
  '/refresh',
  validate(refreshTokenSchema, 'cookies'),
  getNewRefreshToken,
);

// Production refresh: token arrives in the request body (not an HttpOnly cookie)
router.post(
  '/refresh-prod',
  validate(refreshTokenSchema),
  getNewRefreshTokenFromBody,
);

router.use(verifyToken);
router.get('/logout', logout);

export default router;
