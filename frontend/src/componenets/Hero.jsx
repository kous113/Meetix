import "./Hero.css";
import heroimg from "../assets/heroimg.jpg";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

export default function Hero() {

const handleNewMeeting = () => {
  const newMeetingCode = Math.random().toString(36).substring(2, 10);

  navigate(`/${newMeetingCode}`);
};
  return (
    <div className="hero">
      <img className="hero-img" src={heroimg} alt="" />
      <Button onClick={handleNewMeeting} className="nav-new-meeting" variant="contained">
        {" "}
        <AddIcon />
        New Meeting
      </Button>
    </div>
  );
}
