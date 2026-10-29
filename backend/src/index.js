import "dotenv/config";

import express from "express";
import { createServer } from "node:http";
import cors from "cors";

import pool from "./config/db.js";
import createTable from "./models/usermodel.js";
import createMeetTable from "./models/meetingmodel.js";
import userRoutes from "./routes/user.routes.js";

import { connectToSocket } from "./controllers/socketManager.js";

const app = express();
const server = createServer(app);

const port = 8000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/users", userRoutes);

// Test database route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    res.send(`db name ${result.rows[0].current_database}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Start server after creating database tables
const startServer = async () => {
  try {
    await createTable();
    await createMeetTable();

    // Attach Socket.IO to the HTTP server
    connectToSocket(server);

    // Start server
    server.listen(port, () => {
      console.log(`server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
    process.exit(1);
  }
};

startServer();
