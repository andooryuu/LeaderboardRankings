import { useEffect } from "react";

function Test() {
  useEffect(() => {
    fetch(
      `https://leaderboardrankings-1.onrender.com/player/quickdraw/activities`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
      });
  }, []);

  return <div>Test</div>;
}
export default Test;
