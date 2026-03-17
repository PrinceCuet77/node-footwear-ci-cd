import { Router } from 'express';
import {
  getNewRefreshToken,
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
// import { requireLogin } from '@middlewares/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
// router.post(
//   '/forgot-password',
//   authRateLimiter,
//   validate(forgotPasswordSchema),
//   forgotPassword,
// );
// router.post(
//   '/verify-token',
//   authRateLimiter,
//   validate(verifyTokenSchema),
//   verifyToken,
// );
// router.post(
//   '/reset-password',
//   authRateLimiter,
//   validate(resetPasswordSchema),
//   resetPassword,
// );
// router.post(
//   '/login-microsoft',
//   authRateLimiter,
//   validate(microsoftLoginSchema),
//   microsoftLogin,
// );
router.post(
  '/refresh',
  validate(refreshTokenSchema, 'cookies'),
  getNewRefreshToken,
);

router.use(verifyToken);
router.get('/logout', logout);
// router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
