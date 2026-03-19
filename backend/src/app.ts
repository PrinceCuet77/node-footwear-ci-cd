import express, { Response } from 'express';
import userRoutes from '@routes/user.route';
import adminRoutes from '@routes/admin.route';
import authRoutes from '@routes/auth.route';

import cors from 'cors';
// import logger from '@config/logger';
import cookieParser from 'cookie-parser';
import { STATUS_CODE } from '@constants/statusCode';
import errorHandler from '@middlewares/errorHandler';
import { WHITELISTED_IPS } from '@config/whitelistedIps';

const app = express();
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || WHITELISTED_IPS.cors_origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    exposedHeaders: ['content-disposition'],
  }),
);
app.use(cookieParser());
app.set('trust proxy', 1);

// Health check endpoint
app.get('/api/health', (req, res: Response) => {
  res.status(STATUS_CODE.OK).json({
    status: true,
    message: 'Healthy',
  });
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.use(errorHandler);

process.on('uncaughtException', (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'ECONNRESET'
  ) {
    // logger.error('Connection reset by peer');
    process.exit(1);
  } else {
    // logger.error(JSON.stringify(error));
    console.error(error);
    process.exit(1);
  }
});

export default app;
