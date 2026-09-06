import { verifyDiptaToken } from "../utils/diptaJwt.js";

export async function diptaAuthMiddleware(
  c: any,

  next: any,
) {
  try {
    const header = c.req.header("Authorization");

    if (!header) {
      return c.json(
        {
          message: "Token missing",
        },
        401,
      );
    }

    const token = header.split(" ")[1];

    const payload = verifyDiptaToken(token);

    c.set("diptaUser", payload);

    await next();
  } catch (error) {
    return c.json(
      {
        message: "Invalid token",
      },
      401,
    );
  }
}
