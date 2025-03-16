import { useState, useEffect } from "react";
import "./Leaderboard.css"; // Import the CSS file

interface LeaderboardProps {
  uploadSuccess: boolean;
}

interface Score {
  activityDate: string;
  activityTime: string;
  activityName: string;
  durationtype: string;
  cycleDuration: string;
  activityDuration: string;
  lightlogic: string;
  stationNumber: number;
  cycleNumber: number;
  playerName: string;
  avgReactionTime: number;
  totalHits: number;
  totalMissHits: number;
  totalStrikes: number;
  repetitions: number;
  lightsOut: string;
  visualCue2: number;
  visualCue3: number;
  visualCue4: number;
  visualCue5: number;
  visualCue6: number;
  visualCue7: number;
  visualCue8: number;
  visualCue9: number;
  visualCue10: number;
  visualCue11: number;
  visualCue12: number;
  visualCue13: number;
}

function Leaderboard() {
  const [activities, setActivities] = useState([
    {
      id: 1,
      activityName: "LA ZONE TEST",
      activityTime: "12:11:21",
      activityDate: "2024-09-21",
      activityDuration: 11,
      playerName: "AOD23",
      avgReactionTime: 753,
      totalHits: 13,
      totalMissHits: 0,
      durationtype: "seconds",
      cycleDuration: "10",
      lightlogic: "random",
      stationNumber: 1,
      cycleNumber: 1,
      repetitions: 1,
      totalStrikes: 0
    },
    {
      id: 2,
      activityName: "LA ZONE TEST",
      activityTime: "12:10:26",
      activityDate: "2024-09-21",
      activityDuration: 12,
      playerName: "AOD23",
      avgReactionTime: 845,
      totalHits: 13,
      totalMissHits: 0,
      durationtype: "seconds",
      cycleDuration: "10",
      lightlogic: "random",
      stationNumber: 1,
      cycleNumber: 1,
      repetitions: 1,
      totalStrikes: 0
    },
    {
      id: 3,
      activityName: "LA ZONE TEST",
      activityTime: "12:09:54",
      activityDate: "2024-09-21",
      activityDuration: 13,
      playerName: "AOD23",
      avgReactionTime: 930,
      totalHits: 13,
      totalMissHits: 0,
      durationtype: "seconds",
      cycleDuration: "10",
      lightlogic: "random",
      stationNumber: 1,
      cycleNumber: 1,
      repetitions: 1,
      totalStrikes: 0
    },
    {
      id: 4,
      activityName: "RAPID FIRE",
      activityTime: "12:09:22",
      activityDate: "2024-09-21",
      activityDuration: 14,
      playerName: "SNP45",
      avgReactionTime: 626,
      totalHits: 15,
      totalMissHits: 2,
      durationtype: "seconds",
      cycleDuration: "10",
      lightlogic: "random",
      stationNumber: 1,
      cycleNumber: 1,
      repetitions: 1,
      totalStrikes: 0
    },
    {
      id: 5,
      activityName: "RAPID FIRE",
      activityTime: "12:06:22",
      activityDate: "2024-09-21",
      activityDuration: 14,
      playerName: "GHT77",
      avgReactionTime: 569,
      totalHits: 14,
      totalMissHits: 1,
      durationtype: "seconds",
      cycleDuration: "10",
      lightlogic: "random",
      stationNumber: 1,
      cycleNumber: 1,
      repetitions: 1,
      totalStrikes: 0
    },
    {
      id: 6,
      activityName: "PRECISION SHOT",
      activityTime: "12:05:52",
      activityDate: "2024-09-21",
      activityDuration: 15,
      playerName: "KLM90",
      avgReactionTime: 857,
      totalHits: 12,
      totalMissHits: 0,
      durationtype: "seconds",
      cycleDuration: "10",
      lightlogic: "random",
      stationNumber: 1,
      cycleNumber: 1,
      repetitions: 1,
      totalStrikes: 0
    },
    {
      id: 7,
      activityName: "PRECISION SHOT",
      activityTime: "12:03:56",
      activityDate: "2024-09-21",
      activityDuration: 10,
      playerName: "XYZ12",
      avgReactionTime: 593,
      totalHits: 11,
      totalMissHits: 3,
      durationtype: "seconds",
      cycleDuration: "10",
      lightlogic: "random",
      stationNumber: 1,
      cycleNumber: 1,
      repetitions: 1,
      totalStrikes: 0
    }
  ]);

  const [selectedActivity, setSelectedActivity] = useState<string>("ALL");

  const handleActivityChange = (activity: string) => {
    setSelectedActivity(activity);
  };

  const filteredActivities = selectedActivity === "ALL"
    ? activities
    : activities.filter(activity => activity.activityName === selectedActivity);

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
            <th>Cycle Number</th>
            <th>Avg Reaction Time</th>
            <th>Total Hits</th>
            <th>Total Miss Hits</th>
            <th>Total Strikes</th>
            <th>Repetitions</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.map((activity, index) => (
            <tr key={activity.id}>
              <td data-label="Player Name">{activity.playerName}</td>
              <td data-label="Activity Date">{activity.activityDate}</td>
              <td data-label="Activity Time">{activity.activityTime}</td>
              <td data-label="Activity Name">{activity.activityName}</td>
              <td data-label="Duration Type">{activity.durationtype}</td>
              <td data-label="Cycle Duration">{activity.cycleDuration}</td>
              <td data-label="Activity Duration">{activity.activityDuration}</td>
              <td data-label="Light Logic">{activity.lightlogic}</td>
              <td data-label="Station Number">{activity.stationNumber}</td>
              <td data-label="Cycle Number">{activity.cycleNumber}</td>
              <td data-label="Avg Reaction Time">{activity.avgReactionTime}</td>
              <td data-label="Total Hits">{activity.totalHits}</td>
              <td data-label="Total Miss Hits">{activity.totalMissHits}</td>
              <td data-label="Total Strikes">{activity.totalStrikes}</td>
              <td data-label="Repetitions">{activity.repetitions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;