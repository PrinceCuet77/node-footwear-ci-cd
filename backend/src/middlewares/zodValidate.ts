import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { sendResponse } from '@utils/response';
import { STATUS_CODE } from '@constants/statusCode';

export function validate(
  schema: ZodSchema,
  source: 'body' | 'cookies' | 'query' | 'params' = 'body',
) {
  return (req: Request, res: Response, next: NextFunction) => {
    let data: unknown;
    switch (source) {
      case 'body':
        data = req.body;
        break;
      case 'cookies':
        data = req.cookies;
        break;
      case 'query':
        data = req.query;
        break;
      case 'params':
        data = req.params;
        break;
      default:
        data = req.body;
    }

    const result = schema.safeParse(data);
    
    console.log('🚀 ~ validate ~ req.cookies:', req.cookies);
    console.log('🚀 ~ validate ~ result:', result)

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
