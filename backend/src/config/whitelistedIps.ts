import dotenv from 'dotenv';
dotenv.config();

export const WHITELISTED_IPS = {
  cors_origins: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ],
};