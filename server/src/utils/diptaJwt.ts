import jwt from "jsonwebtoken";

import type { DiptaJwtPayload } from "../types/diptaUserType.js";

const SECRET = process.env.DIPTA_JWT_SECRET || "secret";

export function createDiptaToken(payload: DiptaJwtPayload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "1d",
  });
}

export function verifyDiptaToken(token: string) {
  return jwt.verify(token, SECRET);
}
