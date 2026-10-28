import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";


export default function Navbar() {
  const navigate = useNavigate();
  const [meetingcode, setMeetingCode] = useState("");



const { addToUserHistory } = useContext(AuthContext);

const handleVideocall = async () => {
    const code = meetingcode.trim();

    if (!code) {
        return;
    }

    try {
        await addToUserHistory(code);
        navigate(`/${code}`);
    } catch (error) {
        console.error("Failed to save meeting history:", error);
    }
};

const handleNewMeeting = async () => {
    const newMeetingCode = Math.random()
        .toString(36)
        .substring(2, 10);

    try {
        await addToUserHistory(newMeetingCode);
        navigate(`/${newMeetingCode}`);
    } catch (error) {
        console.error("Failed to save meeting history:", error);
    }
};

return (
    <div className="navbar">
        <TextField
            onChange={(e) => setMeetingCode(e.target.value)}
            value={meetingcode}
            className="textfield"
            label="Enter Meeting Link"
            variant="outlined"
            required
        />

        <div className="nav-btn">
            <Button
                onClick={handleVideocall}
                className="join-btn"
                variant="contained"
            >
                Join
            </Button>

            <Button
                onClick={handleNewMeeting}
                className="nav-new-meeting"
                variant="contained"
            >
                <AddIcon />
                New Meeting
            </Button>
        </div>
    </div>
);

}