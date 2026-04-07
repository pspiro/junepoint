export enum UserRole {
  BROKER = 'BROKER',
  BORROWER = 'BORROWER',
  UNDERWRITER = 'UNDERWRITER',
  TITLE = 'TITLE',
  INVESTOR = 'INVESTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  mfaEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
