import { pool } from "../config/db.js";

import type { DiptaUser, SafeDiptaUser } from "../types/diptaUserType.js";

export const DiptaUserModel = {
  async create(
    username: string,

    email: string,

    password: string,

    role: "user" | "admin" = "user",
  ): Promise<SafeDiptaUser> {
    const result = await pool.query(
      `

INSERT INTO dipta_users

(username,email,password,role)

VALUES($1,$2,$3,$4)

RETURNING

id,

username,

email,

role,

created_at,

updated_at

`,

      [username, email, password, role],
    );

    return result.rows[0];
  },

  async findByEmail(email: string): Promise<DiptaUser | null> {
    const result = await pool.query(
      `

SELECT *

FROM dipta_users

WHERE email=$1

`,

      [email],
    );

    return result.rows[0] || null;
  },

  async findById(id: number) {
    const result = await pool.query(
      `

SELECT

id,

username,

email,

role,

created_at,

updated_at


FROM dipta_users

WHERE id=$1

`,

      [id],
    );

    return result.rows[0] || null;
  },
};
