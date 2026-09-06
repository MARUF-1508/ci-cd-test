import { Hono } from "hono";

import {
  registerDipta,
  loginDipta,
  getDiptaMe,
} from "../controllers/diptaAuthController.js";

import { diptaAuthMiddleware } from "../middleware/diptaAuthMiddleware.js";

import { diptaRoleMiddleware } from "../middleware/diptaRoleMiddleware.js";
import type { DiptaJwtPayload } from "../types/diptaUserType.js";

const diptaAuthRoutes = new Hono<{
  Variables: {
    diptaUser: DiptaJwtPayload;
  };
}>();

diptaAuthRoutes.post(
  "/register",

  registerDipta,
);

diptaAuthRoutes.post(
  "/login",

  loginDipta,
);

diptaAuthRoutes.get(
  "/me",

  diptaAuthMiddleware,

  getDiptaMe,
);

diptaAuthRoutes.get(
  "/admin",
  diptaAuthMiddleware,
  diptaRoleMiddleware("admin"),
  (c) => {
    const user = c.get("diptaUser");

    return c.json({
      message: "Admin access granted",
      user,
    });
  },
);

export default diptaAuthRoutes;
