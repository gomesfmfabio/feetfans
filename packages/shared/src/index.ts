/**
 * @feetfans/shared
 * Shared utilities and types for FeetFans marketplace
 */

export const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

export type UserRole = 'creator' | 'buyer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  ageVerified: boolean;
  createdAt: Date;
}
