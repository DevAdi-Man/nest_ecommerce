import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';

export interface RequestWithUser extends ExpressRequest {
  user: JwtPayload;
}
