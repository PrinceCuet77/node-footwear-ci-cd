import { Router } from 'express';
import {
  getAllUsers,
  getSingleUser,
  updateUserRole,
} from '@controllers/admin.controller';
import { verifyToken, requireRole } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/zodValidate';
import { updateUserRoleSchema } from '@validators/user.validator';

const router = Router();

router.use(verifyToken, requireRole('ADMIN'));

router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.patch('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);

export default router;
