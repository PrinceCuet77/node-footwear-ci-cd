import { Router } from 'express';
import { getOwnProfile, updateOwnProfile } from '@controllers/user.controller';
import { verifyToken } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/zodValidate';
import { updateProfileSchema } from '@validators/user.validator';

const router = Router();

router.use(verifyToken);

router.get('/me', getOwnProfile);
router.patch('/me', validate(updateProfileSchema), updateOwnProfile);

export default router;
