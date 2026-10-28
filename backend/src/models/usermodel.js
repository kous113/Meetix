import express from "express";
import pool from "../config/db.js";

const createTable=async()=>{
    const querytext=
    `
        CREATE TABLE IF NOT EXISTS users(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password text NOT NULL,
            token VARCHAR(255) UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `;
    try{
        await pool.query(querytext);
        console.log("user table created");
    }catch(err){
        console.log("error in table creation",err);
    }


};
export default createTable;