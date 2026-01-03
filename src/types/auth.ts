import type { Request } from "express"
export interface JwtUserPayload {
  id: string
  role: Role
  token_version?: string
  iat?: number
  exp?: number
}

export type Role = 'member' | 'librarian' | 'admin' | 'super_admin'

export interface RefreshTokenPayload {
  id: string
  role: Role
  tokenVersion: number
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}