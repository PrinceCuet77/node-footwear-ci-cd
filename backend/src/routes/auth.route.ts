import { Router } from 'express';
import {
  login,
  register,
  //   login,
  //   refreshToken,
  //   logout,l
  //   forgotPassword,
  //   verifyToken,
  //   resetPassword,
  //   microsoftLogin,
  //   changePassword,
} from '@controllers/auth.controller';
import { validate } from '@middlewares/zodValidate';
import { loginSchema, registerSchema } from '@validators/auth.validator';
import { authRateLimiter } from '@middlewares/rateLimiter.middleware';
// import { requireLogin } from '@middlewares/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
// router.post('/login', authRateLimiter, validate(loginSchema), login);
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
// router.post('/refresh', validate(refreshSchema, 'cookies'), refreshToken);

// router.use(requireLogin);
// router.post('/logout', validate(logoutSchema, 'cookies'), logout);
// router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
