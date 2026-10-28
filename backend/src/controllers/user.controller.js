import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import httpStatus from "http-status";
import crypto from "crypto";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=($1)",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User Already Exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3)",
      [name, email, hashedPassword],
    );
    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

//Log in
const logIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide required information" });
  }
  try {
    const data = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (data.rows.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Wrong email or password" });
    }
    const user = data.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Wrong username or password" });
    }
    const token = crypto.randomBytes(20).toString("hex");
    await pool.query("UPDATE users SET token = $1 WHERE id = $2", [
      token,
      user.id,
    ]);
    res.status(httpStatus.OK).json({ token: token, name: user.name });
    console.log("log in successful");
  } catch (err) {
    res.status(500).json({ message: `Something went wrong ${err}` });
  }
};

const validate = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE token = $1",
    [token],
  );
  if (result.rows.length === 0) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
  return res.status(200).json({
    message: "Token is valid",
  });
};

const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const userResult = await pool.query(
      `SELECT id FROM users WHERE token = $1`,
      [token],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userId = userResult.rows[0].id;

    const meetingsResult = await pool.query(
      `SELECT * FROM meetings
             WHERE user_id = $1
             ORDER BY date DESC`,
      [userId],
    );

    return res.status(200).json(meetingsResult.rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT id FROM users WHERE token = $1`,
      [token],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO meetings (user_id, "meetingCode")
             VALUES ($1, $2)`,
      [userId, meeting_code],
    );

    return res.status(httpStatus.CREATED).json({
      message: "Added code to history",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export { register, logIn, validate, getUserHistory, addToHistory };
