import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import HomePage from "./Home";
import StatsPage from "./StatsPage";
//import LeaderboardPage from "./components/LeaderboardPage";
import NavBar from "./NavBar";
import Leaderboard from "./Leaderboard";
import { Upload } from "lucide-react";
//import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <Routes>
          
          {<Route path="/" element={<HomePage />} />}
          <Route path="/stats/:username" element={<StatsPage />} />
          <Route path="/leaderboard" element={<Leaderboard />}/>
          <Route path="/upload" element={<Upload />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
