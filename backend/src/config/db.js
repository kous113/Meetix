import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_DBPORT,
    });

pool.on("connect", () => {
  console.log("Database successfully connected");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err.message);
});

export default pool;
