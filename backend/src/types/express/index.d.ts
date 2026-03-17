import { TokenPayload } from '@src/interface/token.type';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<TokenPayload, 'id' | 'email' | 'role'>;
    }
  }
}
