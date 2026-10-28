import { Link } from "react-router-dom";
import "./Home.css";

import logo from "../assets/Logo.png";
import backgroundImage from "../assets/backgroundImage.jpg";

export default function Home() {
  return (
    <div
      className="home"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <header className="home-header">
        <div>
          <Link to="/" className="home-logo">
            <img src={logo} alt="MeetApp Logo" />
          </Link>
        </div>
        <div className="landingpage-buttons">
          <Link to="/signup" className="join-link">
            Join as Guest
          </Link>

          <Link to="/auth" className="join-link">
            Register
          </Link>

          <Link to="/auth" className="join-link">
            Log In
          </Link>
        </div>
      </header>

      <div className="landingMainContainer">
        <div>
          <h1><span>Connect</span> beyond boundaries</h1>
          <p>Bringing people together, wherever they are.</p>
          <div className="create-buttons" role="button">
            <Link to="/auth">Get Started</Link>
          </div>
        </div>

        <div>
          <img className="monitor-img" src="/monitor.png" />
        </div>
</div>
    </div>
  );
}
