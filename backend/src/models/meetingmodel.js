import pool from "../config/db.js";

const createMeetTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS meetings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            "meetingCode" VARCHAR(255) NOT NULL,
            date TIMESTAMP DEFAULT NOW() NOT NULL
        );
    `;

    try {
        await pool.query(queryText);
        console.log("Meeting table created");
    } catch (err) {
        console.log("Error in meeting table creation", err);
    }
};

export default createMeetTable;