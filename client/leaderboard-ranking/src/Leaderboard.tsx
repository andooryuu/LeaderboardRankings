import { useState, useEffect } from "react";

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

function Leaderboard({ uploadSuccess }: LeaderboardProps) {
  const [scores, setScores] = useState([]);
  console.log("uploadSuccess prop:", uploadSuccess);
  useEffect(() => {
    const fetchScores = async () => {
      if (uploadSuccess) {
        const response = await fetch("http://localhost:5000/scores");
        const data = await response.json();
        setScores(data);
      }
    };

    fetchScores();
  }, [uploadSuccess]); // Trigger useEffect when uploadSuccess changes

  return (
    <div>
      <h1>Leaderboard Ranking</h1>
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
          {scores.map((score: Score, index: number) => (
            <tr key={index}>
              <td>{score.playerName}</td>
              <td>{score.activityDate}</td>
              <td>{score.activityTime}</td>
              <td>{score.activityName}</td>
              <td>{score.durationtype}</td>
              <td>{score.cycleDuration}</td>
              <td>{score.activityDuration}</td>
              <td>{score.lightlogic}</td>
              <td>{score.stationNumber}</td>
              <td>{score.cycleNumber}</td>
              <td>{score.avgReactionTime}</td>
              <td>{score.totalHits}</td>
              <td>{score.totalMissHits}</td>
              <td>{score.totalStrikes}</td>
              <td>{score.repetitions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
