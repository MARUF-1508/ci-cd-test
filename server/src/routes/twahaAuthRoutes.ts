import { Hono } from "hono";
import { register, login, getAccountInfo, updateAccountRole } from "../controllers/twahaAuthController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const twahaAuthRoutes = new Hono();

// public routes
twahaAuthRoutes.post("/register", register);
twahaAuthRoutes.post("/login", login);

// protected routes
twahaAuthRoutes.get("/account-info", authMiddleware, getAccountInfo);
twahaAuthRoutes.put("/update-account-role", authMiddleware, updateAccountRole);

export default twahaAuthRoutes;
