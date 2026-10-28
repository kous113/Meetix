import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Authentication from "./pages/Authentication.jsx";
import { Authprovider } from "./contexts/AuthContext.jsx";
import VideoMeetComponent from "./pages/Videomeet.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/history.jsx";

function App() {
  return (
    <div className="App">
      <Authprovider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/history" element={<History />} />

          <Route path="/:url" element={<VideoMeetComponent/>}/>
        </Routes>
      </Authprovider>
    </div>
  );
}

export default App;
