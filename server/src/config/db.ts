import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || process.env.POSTGRES_PORT || 5432),
  database:
    process.env.DB_NAME || process.env.POSTGRES_DB_NAME || "myappdb_dev",
  user: process.env.DB_USER || process.env.POSTGRES_USER || "postgres",
  password:
    process.env.DB_PASSWORD ||
    process.env.POSTGRES_PASSWD ||
    process.env.POSTGRES_PASSWORD ||
    "devpassword123",
});

export const initDb = async () => {
  const postsQuery = `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka'),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka')
    );
  `;

  const anindyaUsersQuery = `
    CREATE TABLE IF NOT EXISTS anindya_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka'),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka')
    );
  `;
  try {
    await pool.query(postsQuery);
    await pool.query(anindyaUsersQuery);
    console.log(
      "Database initialized successfully (posts and anindya_users tables ready).",
    );
  } catch (err) {
    console.error("Error initializing database table:", err);
  }
};
