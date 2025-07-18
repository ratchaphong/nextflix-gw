export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number; // issued at (optional)
  exp?: number; // expiry timestamp (optional)
}
