import type { Context } from "hono";
import bcrypt from "bcryptjs";
import { TwahaUserModel } from "../models/twahaUserModel.js";
import { signToken } from "../utils/jwt.js";

// POST /api/twaha/auth/register
export const register = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ errCode: 210, errMsg: "Invalid JSON body" }, 400);
    }

    const { username, email, password } = body;

    const cleanUsername = typeof username === "string" ? username.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    if (!cleanUsername) {
      return c.json({ errCode: 211, errMsg: "Username is required" }, 400);
    }
    if (cleanUsername.length < 3) {
      return c.json(
        { errCode: 212, errMsg: "Username must be at least 3 characters" },
        400,
      );
    }
    if (cleanUsername.length > 100) {
      return c.json(
        { errCode: 213, errMsg: "Username must be at most 100 characters" },
        400,
      );
    }

    if (!cleanEmail) {
      return c.json({ errCode: 214, errMsg: "Email is required" }, 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return c.json({ errCode: 215, errMsg: "Invalid email format" }, 400);
    }

    if (!cleanPassword) {
      return c.json({ errCode: 216, errMsg: "Password is required" }, 400);
    }
    if (cleanPassword.length < 6) {
      return c.json(
        { errCode: 217, errMsg: "Password must be at least 6 characters" },
        400,
      );
    }
    if (cleanPassword.length > 255) {
      return c.json(
        { errCode: 218, errMsg: "Password must be at most 255 characters" },
        400,
      );
    }

    const existing = await TwahaUserModel.findByEmailOrUsername(
      cleanEmail,
      cleanUsername,
    );
    if (existing) {
      if (existing.email === cleanEmail) {
        return c.json(
          { errCode: 219, errMsg: "Email already registered" },
          409,
        );
      }
      if (existing.username === cleanUsername) {
        return c.json({ errCode: 220, errMsg: "Username already taken" }, 409);
      }
      return c.json({ errCode: 221, errMsg: "User already exists" }, 409);
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const newUser = await TwahaUserModel.create(
      cleanUsername,
      cleanEmail,
      hashedPassword,
    );

    const token = signToken({
      id: newUser.id,
      name: newUser.username,
      email: newUser.email,
      role: (newUser.role == 'ADMIN') ? "admin" : "user"
    });

    return c.json(
      {
        message: "User registered successfully",
        user: newUser,
        token,
      },
      201,
    );
  } catch (error) {
    console.error("Register error:", error);
    return c.json(
      {
        errCode: 222,
        errMsg: "Failed to register user due to internal server error",
      },
      500,
    );
  }
};

// POST /api/twaha/auth/login
export const login = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ errCode: 230, errMsg: "Invalid JSON body" }, 400);
    }

    // Allow login with email or username via "email" or "username" or "identifier" (case-sensitive)
    const identifierRaw = body.email ?? body.username ?? body.identifier ?? "";
    const passwordRaw = body.password ?? "";

    const identifier =
      typeof identifierRaw === "string" ? identifierRaw.trim() : "";
    const password = typeof passwordRaw === "string" ? passwordRaw : "";

    if (!identifier) {
      return c.json(
        { errCode: 231, errMsg: "Email or username is required" },
        400,
      );
    }
    if (!password) {
      return c.json({ errCode: 232, errMsg: "Password is required" }, 400);
    }

    const user = await TwahaUserModel.findByLoginIdentifier(identifier);

    if (!user) {
      return c.json({ errCode: 234, errMsg: "Invalid credentials" }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return c.json({ errCode: 235, errMsg: "Invalid credentials" }, 401);
    }

    const token = signToken({
      id: user.id,
      name: user.username,
      email: user.email,
      role: (user.role == 'ADMIN') ? "admin" : "user"
    });

    const loggedInUserInfo = {
      id: user.id,
      username: user.username,
    };

    return c.json(
      {
        message: "Login successful",
        user: loggedInUserInfo,
        token,
      },
      200,
    );
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      { errCode: 234, errMsg: "Failed to login due to internal server error" },
      500,
    );
  }
};

// GET /api/twaha/auth/account-info
export const getAccountInfo = async (c: Context) => {
  try {
    const payload = c.get("user");
    if (!payload) {
      return c.json({ errCode: 300, errMsg: "Unauthorized" }, 401);
    }

    const user = await TwahaUserModel.findByUsername(payload.username);
    if (!user) {
      return c.json({ errCode: 235, errMsg: "User not found" }, 404);
    }

    return c.json({ user }, 200);
  } catch (error) {
    console.error("Failed to get user account details. Error: ", error);
    return c.json({ errCode: 236, errMsg: "Failed to fetch user" }, 500);
  }
};

// PUT /api/twaha/auth/update-account-role
export const updateAccountRole = async (c: Context) => {
  try {
    const payload = c.get("user");
    if (!payload) {
      return c.json({ errCode: 300, errMsg: "Unauthorized" }, 401);
    }

    const user = await TwahaUserModel.findByUsername(payload.username);
    if (!user) {
      return c.json({ errCode: 301, errMsg: "User not found" }, 404);
    }

    if (user.role !== "ADMIN") {
      return c.json({ errCode: 302, errMsg: "Unauthorized: Action requires 'ADMIN' role" }, 401);
    }

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ errCode: 230, errMsg: "Invalid JSON body" }, 400);
    }

    if (body.role !== 'USER' && body.role !== 'ADMIN') {
      return c.json({ errCode: 250, errMsg: "Invalid request JSON: role can only be 'USER' or 'ADMIN'" }, 400);
    }

    const resp = await TwahaUserModel.updateUserRoleById(body.username, body.role);
    if (resp.role !== body.role) {
      return c.json({ errCode: 230, errMsg: "Invalid username provided" }, 400);
    }

    return c.json({ username: body.username, role: resp.role }, 200);
  } catch (error) {
    console.error("Failed to get user account details. Error: ", error);
    return c.json({ errCode: 236, errMsg: "Failed to fetch user" }, 500);
  }
};
