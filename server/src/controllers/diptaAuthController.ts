import type { Context } from "hono";

import bcrypt from "bcrypt";

import { DiptaUserModel } from "../models/diptaUserModel.js";

import { createDiptaToken } from "../utils/diptaJwt.js";

export async function registerDipta(c: Context) {
  const {
    username,

    email,

    password,

    role,
  } = await c.req.json();

  const existing = await DiptaUserModel.findByEmail(email);

  if (existing) {
    return c.json(
      {
        message: "Email already exists",
      },
      409,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await DiptaUserModel.create(
    username,

    email,

    hashedPassword,

    role || "user",
  );

  return c.json(
    {
      message: "Registered successfully",

      user,
    },

    201,
  );
}

export async function loginDipta(c: Context) {
  const {
    email,

    password,
  } = await c.req.json();

  const user = await DiptaUserModel.findByEmail(email);

  if (!user) {
    return c.json(
      {
        message: "Invalid credentials",
      },
      401,
    );
  }

  const match = await bcrypt.compare(
    password,

    user.password,
  );

  if (!match) {
    return c.json(
      {
        message: "Invalid credentials",
      },
      401,
    );
  }

  const token = createDiptaToken({
    id: user.id,

    username: user.username,

    email: user.email,

    role: user.role,
  });

  return c.json({
    token,
  });
}

export async function getDiptaMe(c: Context) {
  const user = c.get("diptaUser");

  return c.json({
    user,
  });
}
