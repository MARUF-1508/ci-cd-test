export type UserRole = "user" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
};

export type SafeUser = Omit<User, "password">;

export type JwtPayload = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};
