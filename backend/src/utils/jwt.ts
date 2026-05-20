import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types';

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions);
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwt.secret) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as AuthPayload;
}
