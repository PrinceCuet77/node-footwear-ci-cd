import { STATUS_CODE } from '@constants/statusCode';
import { sendResponse } from '@utils/response';
import type { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  httpCode?: STATUS_CODE;
  stack?: string;
}

const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);
  sendResponse(
    res,
    err.message ?? 'Internal Server Error',
    err.httpCode ?? STATUS_CODE.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'development' ? err.stack : null,
  );
};

export default errorHandler;
