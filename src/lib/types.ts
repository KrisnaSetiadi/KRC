export type UserRole = "admin" | "user";

export interface UnsavedSubmission {
  userId: string;
  userName: string;
  userDivision: string;
  images: string[]; // data URLs
  description: string;
}

export interface Submission extends Omit<UnsavedSubmission, 'images'> {
  id: string;
  images: string[]; // storage URLs
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  division: string;
  email: string;
  password?: string; // Should not be stored long-term
  status: 'pending' | 'approved';
  role?: UserRole;
}
