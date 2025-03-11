import { useState, useEffect } from "react";

interface LeaderboardProps {
  uploadSuccess: boolean;
}

function Leaderboard({ uploadSuccess }: LeaderboardProps) {
  const [scores, setScores] = useState([]);
  console.log("uploadSuccess prop:", uploadSuccess);
  useEffect(() => {
    const fetchScores = async () => {
      if (uploadSuccess) {
        const response = await fetch("http://localhost:5000/scores");
        const data = await response.json();
        console.log(data);
      }
    };

    fetchScores();
  }, [uploadSuccess]); // Trigger useEffect when uploadSuccess changes

  return (
    <div>
      <h1>Leaderboard Ranking</h1>
    </div>
  );
}

export default Leaderboard;
