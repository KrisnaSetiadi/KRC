export type UserRole = "admin" | "user";

export interface Submission {
  id: string;
  userId: string;
  userName: string;
  userDivision: string;
  images: string[];
  description: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  division: string;
  email: string;
  password: string; // Di aplikasi nyata, ini akan menjadi kata sandi yang di-hash
  status: 'pending' | 'approved';
}
