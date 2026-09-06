export type DiptaRole = "user" | "admin";

export type DiptaUser = {
  id: number;

  username: string;

  email: string;

  password: string;

  role: DiptaRole;

  created_at: Date;

  updated_at: Date;
};

export type SafeDiptaUser = Omit<DiptaUser, "password">;

export type DiptaJwtPayload = {
  id: number;

  username: string;

  email: string;

  role: DiptaRole;
};
