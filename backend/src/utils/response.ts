import type { Response } from 'express';
import { STATUS_CODE } from '@constants/statusCode';
import { ErrorResponse, SuccessResponse } from '@src/interface/response.type';

export function sendResponse<T = unknown>(
  res: Response,
  message: string,
  status: STATUS_CODE = 200,
  data?: T,
) {
  if (status >= 200 && status < 400) {
    const response: SuccessResponse<T> = { success: true, message };
    if (data !== undefined) response.data = data;
    return res.status(status).json(response);
  } else {
    const response: ErrorResponse = { success: false, message };
    if (data !== undefined) response.errors = data;
    return res.status(status).json(response);
  }
}
