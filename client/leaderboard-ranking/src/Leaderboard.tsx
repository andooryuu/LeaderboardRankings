import { useState, useEffect } from "react";
import "./Leaderboard.css"; // Import the CSS file

interface LeaderboardProps {
  uploadSuccess: boolean;
}

interface Score {
  session_id: number;
  activity_date: string;
  activity_time: string;
  activity_name: string;
  duration_type: string;
  activity_duration: string;
  light_logic: string;
  station_number: number;
  player_id: number;
  username: string;
  avg_react_time: number;
  total_hits: number;
  total_miss_hits: number;
  total_strikes: number;
  levels: string;
  steps: string;
}

function Leaderboard() {
  const [activities, setActivities] = useState<Score[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("ALL");
  const [players , setPlayers] = useState([]);
  const [sessions, setSession] = useState([]); 

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("http://localhost:5000/scores");
        const data = await response.json();
        setActivities(data.activity);
        console.log(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityChange = (activity: string) => {
    setSelectedActivity(activity);
  };

  const filteredActivities = selectedActivity === "ALL"
    ? activities
    : activities.filter(activity => activity.activity_name === selectedActivity);

  return (
    <div className="container">
      <h1>Leaderboard Ranking</h1>
      <div className="activity-toggle">
        <button onClick={() => handleActivityChange("ALL")}>All</button>
        <button onClick={() => handleActivityChange("LA ZONE TEST")}>LA ZONE TEST</button>
        <button onClick={() => handleActivityChange("RAPID FIRE")}>RAPID FIRE</button>
        <button onClick={() => handleActivityChange("PRECISION SHOT")}>PRECISION SHOT</button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Activity Date</th>
            <th>Activity Time</th>
            <th>Activity Name</th>
            <th>Duration Type</th>
            <th>Cycle Duration</th>
            <th>Activity Duration</th>
            <th>Light Logic</th>
            <th>Station Number</th>
            <th>Avg Reaction Time</th>
            <th>Total Hits</th>
            <th>Total Miss Hits</th>
            <th>Total Strikes</th>
            <th>Repetitions</th>
          </tr>
        </thead>
        <tbody>
          {activities && filteredActivities.map((activity) => (
            <tr key={activity.session_id}>
              <td data-label="Player Name">{activity.username}</td>
              <td data-label="Activity Date">{activity.activity_date}</td>
              <td data-label="Activity Time">{activity.activity_time}</td>
              <td data-label="Activity Name">{activity.activity_name}</td>
              <td data-label="Duration Type">{activity.duration_type}</td>
              <td data-label="Activity Duration">{activity.activity_duration}</td>
              <td data-label="Light Logic">{activity.light_logic}</td>
              <td data-label="Station Number">{activity.station_number}</td>
              <td data-label="Avg Reaction Time">{activity.avg_react_time}</td>
              <td data-label="Total Hits">{activity.total_hits}</td>
              <td data-label="Total Miss Hits">{activity.total_miss_hits}</td>
              <td data-label="Total Strikes">{activity.total_strikes}</td>
              <td data-label="Levels">{activity.levels}</td>
              <td data-label="Steps">{activity.steps}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;