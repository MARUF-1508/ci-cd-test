import { pool } from "../config/db.js";
import type { PublicUserInfo, TwahaUser } from "../types/userType.js";

export const TwahaUserModel = {
  async create(
    username: string,
    email: string,
    hashedPassword: string,
  ): Promise<PublicUserInfo> {
    const query = `
      INSERT INTO twaha_users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at AS createdAt
    `;
    const res = await pool.query(query, [username, email, hashedPassword]);
    return res.rows[0];
  },

  async findByEmail(email: string): Promise<TwahaUser | null> {
    const query = `SELECT * FROM twaha_users WHERE email = $1`;
    const res = await pool.query(query, [email]);
    return res.rows[0] || null;
  },

  async findByUsername(username: string): Promise<TwahaUser | null> {
    const query = `SELECT * FROM twaha_users WHERE username = $1`;
    const res = await pool.query(query, [username]);
    return res.rows[0] || null;
  },

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<TwahaUser | null> {
    const query = `SELECT * FROM twaha_users WHERE email = $1 OR username = $2`;
    const res = await pool.query(query, [email, username]);
    return res.rows[0] || null;
  },

  async findById(id: number): Promise<PublicUserInfo | null> {
    const query = `SELECT id, username, email, created_at FROM twaha_users WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  },

  async findByLoginIdentifier(identifier: string): Promise<TwahaUser | null> {
    // allow login with either email or username (case-sensitive)
    const query = `SELECT * FROM twaha_users WHERE email = $1 OR username = $1`;
    const res = await pool.query(query, [identifier]);
    return res.rows[0] || null;
  },

  async updateUserRoleById(username: string, role: string): Promise<{ role: string | null }> {
    // allow login with either email or username (case-sensitive)
    const query = `UPDATE twaha_users SET role = $2 WHERE username = $1 RETURNING role;`;
    const res = await pool.query(query, [username, role]);
    return res.rows[0] || null;
  },
};
