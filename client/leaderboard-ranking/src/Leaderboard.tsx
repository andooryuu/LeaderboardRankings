import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import Score from "./components/Score";
import Activity from "./components/Activity";
import Session from "./components/Session";
import Player from "./components/Player";

function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [selectedActivity, setSelectedActivity] = useState<string>("ALL");

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://leaderboardrankings-1.onrender.com/scores"
        );
        const data = await response.json();

        // Store the data locally first
        const playersData = data.player;
        const activitiesData = data.activity;
        const sessionsData = data.session;
        const sessionActivitiesData = data.session_activity;

        // Update state variables
        setActivities(activitiesData);

        // Build newScores using the local variables, not the state variables
        const newScores: Score[] = [];

        for (let i = 0; i < sessionActivitiesData.length; i++) {
          const sessionActivity = sessionActivitiesData[i];
          const session = sessionsData.find(
            (s: Session) => s.session_id === sessionActivity.session_id
          );
          const activity = activitiesData.find(
            (a: Activity) => a.activity_id === sessionActivity.activity_id
          );
          const player = playersData.find(
            (p: Player) => p.player_id === session?.player_id
          );

          if (session && activity && player) {
            newScores.push({
              session_id: session.session_id,
              activity_date: activity.activity_date,
              activity_time: activity.activity_time,
              activity_name: activity.activity_name,
              duration_type: session.duration_type,
              activity_duration: activity.activity_duration.toString(),
              light_logic: activity.light_logic,
              station_number: session.station_number,
              player_id: player.player_id,
              username: player.username,
              avg_react_time: session.avg_react_time,
              total_hits: session.total_hits,
              total_miss_hits: session.total_miss_hits,
              total_strikes: session.total_strikes,
              levels: session.levels.toString(),
              steps: session.steps.toString(),
              id: sessionActivity.id,
            });
          }
        }

        console.log("New scores:", newScores);
        setScores(newScores);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const handleActivityChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedActivity(event.target.value);
  };

  const filteredActivities =
    selectedActivity === "ALL"
      ? scores
      : scores.filter(
          (score: Score) => score.activity_name === selectedActivity
        );

  // Get unique activity names for the dropdown

  if (loading) {
    return (
      <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-light me-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="fs-4">Loading leaderboard...</div>
      </div>
    );
  }
  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light">
      <div className="container py-4">
        {/* Header Card */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h1 className="card-title display-6 fw-bold mb-4">
              Leaderboard Ranking
            </h1>

            <div className="row justify-content-center mb-4">
              <div className="col-md-6 col-lg-4">
                <select
                  className="form-select bg-dark text-light border-secondary"
                  value={selectedActivity}
                  onChange={handleActivityChange}
                  aria-label="Select activity"
                >
                  <option value="ALL">ALL</option>
                  {activities.map((a) => (
                    <option key={a.activity_id} value={a.activity_name}>
                      {a.activity_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table Card */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h2 className="card-title h4 fw-bold mb-4">Top Performers</h2>
            <div className="table-responsive">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Player Name</th>
                    <th scope="col">Activity Date</th>
                    <th scope="col">Activity Time</th>
                    <th scope="col">Activity Name</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Avg Reaction Time</th>
                    <th scope="col">Total Hits</th>
                    <th scope="col">Miss Hits</th>
                    <th scope="col">Strikes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((score: Score, index) => {
                    let medalIcon = null;

                    if (index === 0) {
                      medalIcon = <Award size={24} className="text-warning" />; // Gold
                    } else if (index === 1) {
                      medalIcon = <Award size={24} className="text-light" />; // Silver
                    } else if (index === 2) {
                      medalIcon = (
                        <Award size={24} className="text-secondary" />
                      ); // Bronze
                    }

                    return (
                      <tr key={score.id} className={index < 3 ? "bg-dark" : ""}>
                        <td className="align-middle">
                          {medalIcon ? (
                            <div className="d-flex align-items-center">
                              {medalIcon}
                              <span>{index + 1}</span>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center">
                              <span className="ms-4">{index + 1}</span>
                            </div>
                          )}
                        </td>
                        <td className="fw-bold">{score.username}</td>
                        <td>{score.activity_date}</td>
                        <td>{score.activity_time}</td>
                        <td>{score.activity_name}</td>
                        <td>
                          {score.activity_duration} {score.duration_type}
                        </td>
                        <td>{score.avg_react_time} ms</td>
                        <td>{score.total_hits}</td>
                        <td>{score.total_miss_hits}</td>
                        <td>{score.total_strikes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Responsive mobile-friendly data cards that only show on small screens */}
        <div className="d-md-none">
          {filteredActivities.map((score, index) => {
            let medalIcon = null;

            if (index === 0) {
              medalIcon = <Award size={24} className="text-warning" />; // Gold
            } else if (index === 1) {
              medalIcon = <Award size={24} className="text-light" />; // Silver
            } else if (index === 2) {
              medalIcon = <Award size={24} className="text-secondary" />; // Bronze
            }

            return (
              <div
                key={score.id}
                className="card bg-black text-light border-0 shadow mb-3"
              >
                <div className="card-header bg-dark d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {medalIcon && <span className="me-2">{medalIcon}</span>}
                    <span className="fw-bold">{score.username}</span>
                  </div>
                  <span>Rank #{index + 1}</span>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Activity:
                      </small>
                      <span>{score.activity_name}</span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Date/Time:
                      </small>
                      <span>
                        {score.activity_date} {score.activity_time}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Duration:
                      </small>
                      <span>
                        {score.activity_duration} {score.duration_type}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Reaction Time:
                      </small>
                      <span>{score.avg_react_time} ms</span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Hits/Misses:
                      </small>
                      <span>
                        {score.total_hits}/{score.total_miss_hits}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">Strikes:</small>
                      <span>{score.total_strikes}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-center py-4 mt-auto">
        <p className="text-secondary mb-0">
          © 2025 Airsoft Tracker | LA ZONE Training System
        </p>
      </footer>
    </div>
  );
}

export default Leaderboard;
