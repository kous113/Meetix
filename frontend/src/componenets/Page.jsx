import "./Page.css";

import AuthWrapper from "../componenets/AuthWrapper.jsx";
import Sidebar from "../componenets/Sidebar.jsx";
import Navbar from "../componenets/Navbar.jsx";
import Welcome from "../componenets/Welcome.jsx";
import Hero from "../componenets/Hero.jsx";

export default function Page() {
  return (
    <div className="Page">
      <AuthWrapper />

      <div className="main-area">
        <Sidebar />

        <div className="content-area">
          <Navbar />
          <Welcome />
          <Hero />
        </div>
      </div>
    </div>
  );
}
