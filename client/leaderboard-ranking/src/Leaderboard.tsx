import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";

// Define proper TypeScript interfaces for our data structure
interface Activity {
  activity_duration: number;
  activity_hits: number;
  activity_miss_hits: number;
  activity_avg_react_time: number;
  activity_strikes: number;
  activity_time: string;
  activity_date: string;
}

interface ActivityScore {
  activity_name: string;
  activities: Activity[];
}

interface UserScore {
  username: string;
  scores: ActivityScore[];
}

// Interface for flattened activity data we'll use for display
interface FlattenedActivity {
  id: string;
  username: string;
  activity_name: string;
  activity_date: string;
  activity_time: string;
  duration: number;
  avg_react_time: number;
  total_hits: number;
  total_miss_hits: number;
  total_strikes: number;
}

function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [activities, setActivities] = useState<{ activity_name: string }[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("ALL");
  const [allActivities, setAllActivities] = useState<FlattenedActivity[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<
    FlattenedActivity[]
  >([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/scores");
        const data = await response.json();

        setUserScores(data);

        const uniqueActivities: { activity_name: string }[] = [];
        const activityNames = new Set<string>();

        data.forEach((user: UserScore) => {
          user.scores.forEach((score) => {
            if (!activityNames.has(score.activity_name)) {
              activityNames.add(score.activity_name);
              uniqueActivities.push({ activity_name: score.activity_name });
            }
          });
        });

        setActivities(uniqueActivities);

        // Set default activity if we have activities
        if (uniqueActivities.length > 0) {
          setSelectedActivity("ALL"); // Start with ALL by default
        }

        // Create flattened activities for display
        const flattened: FlattenedActivity[] = [];

        data.forEach((user: UserScore) => {
          user.scores.forEach((score) => {
            score.activities.forEach((activity) => {
              flattened.push({
                id: `${user.username}-${score.activity_name}-${activity.activity_date}-${activity.activity_time}`,
                username: user.username,
                activity_name: score.activity_name,
                activity_date: activity.activity_date,
                activity_time: activity.activity_time,
                duration: activity.activity_duration,
                avg_react_time: activity.activity_avg_react_time,
                total_hits: activity.activity_hits,
                total_miss_hits: activity.activity_miss_hits,
                total_strikes: activity.activity_strikes,
              });
            });
          });
        });

        // Sort by total hits (highest first)
        flattened.sort((a, b) => b.total_hits - a.total_hits);

        setAllActivities(flattened);
        setDisplayedActivities(flattened); // Initially display all
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  // Filter activities when selectedActivity changes
  useEffect(() => {
    if (allActivities.length === 0) return;

    // Filter based on selected activity but don't modify the original data
    const filtered =
      selectedActivity === "ALL"
        ? [...allActivities] // Create a copy of all activities
        : allActivities.filter(
            (item) => item.activity_name === selectedActivity
          );

    // Sort by total hits (highest first)
    filtered.sort((a, b) => b.total_hits - a.total_hits);

    // Update only the displayed activities, keeping the full dataset intact
    setDisplayedActivities(filtered);
  }, [selectedActivity, allActivities]);

  const handleActivityChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedActivity(event.target.value);
  };

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
                  <option value="ALL">All Activities</option>
                  {activities.map((a) => (
                    <option key={a.activity_name} value={a.activity_name}>
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
                  {displayedActivities.map((activity, index) => {
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
                      <tr
                        key={activity.id}
                        className={index < 3 ? "bg-dark" : ""}
                      >
                        <td className="align-middle">
                          {medalIcon ? (
                            <div className="d-flex align-items-center">
                              {medalIcon}
                              <span className="ms-2">{index + 1}</span>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center">
                              <span className="ms-4">{index + 1}</span>
                            </div>
                          )}
                        </td>
                        <td className="fw-bold">{activity.username}</td>
                        <td>{activity.activity_date}</td>
                        <td>{activity.activity_time}</td>
                        <td>{activity.activity_name}</td>
                        <td>{activity.duration} sec</td>
                        <td>{activity.avg_react_time} ms</td>
                        <td>{activity.total_hits}</td>
                        <td>{activity.total_miss_hits}</td>
                        <td>{activity.total_strikes}</td>
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
          {displayedActivities.map((activity, index) => {
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
                key={activity.id}
                className="card bg-black text-light border-0 shadow mb-3"
              >
                <div className="card-header bg-dark d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {medalIcon && <span className="me-2">{medalIcon}</span>}
                    <span className="fw-bold">{activity.username}</span>
                  </div>
                  <span>Rank #{index + 1}</span>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Activity:
                      </small>
                      <span>{activity.activity_name}</span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Date/Time:
                      </small>
                      <span>
                        {activity.activity_date} {activity.activity_time}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Duration:
                      </small>
                      <span>{activity.duration} sec</span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Reaction Time:
                      </small>
                      <span>{activity.avg_react_time} ms</span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">
                        Hits/Misses:
                      </small>
                      <span>
                        {activity.total_hits}/{activity.total_miss_hits}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="d-block text-secondary">Strikes:</small>
                      <span>{activity.total_strikes}</span>
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
