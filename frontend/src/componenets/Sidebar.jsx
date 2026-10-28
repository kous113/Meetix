import { Link } from "react-router-dom";
import "./Sidebar.css";
import logo from "../assets/Logo.png";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <img className="logo-img" src={logo} alt="logo" />

      <div className="sidebar-items">
        <Link className="history-link ele" to="/history">
          History
        </Link>

        <p className="ele">User</p>
      </div>
    </div>
  );
}
