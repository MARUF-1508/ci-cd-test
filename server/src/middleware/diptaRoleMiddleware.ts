export function diptaRoleMiddleware(requiredRole: string) {
  return async (
    c: any,

    next: any,
  ) => {
    const user = c.get("diptaUser");

    if (user.role !== requiredRole) {
      return c.json(
        {
          message: "Forbidden",
        },
        403,
      );
    }

    await next();
  };
}
