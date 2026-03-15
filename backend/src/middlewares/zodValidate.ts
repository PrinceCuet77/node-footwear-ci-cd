import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { sendResponse } from '@utils/response';
import { STATUS_CODE } from '@constants/statusCode';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendResponse(
        res,
        'Validation failed',
        STATUS_CODE.BAD_REQUEST,
        errors,
      );
    }

    req.body = result.data;
    next();
  };
}
