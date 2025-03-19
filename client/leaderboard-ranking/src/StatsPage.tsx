import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, Award, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import Session from "./components/Session";
import Activity from "./components/Activity";

// Define interface for user data
interface UserData {
  username: string;
  total_sessions: number;
  bestReactionTime: number;
  avgReactionTime: number;
  sessionHistory: DisplaySession[];
}

interface DisplaySession {
  session_id: number;
  station_number: number;
  avg_react_time: number;
  total_hits: number;
  total_miss_hits: number;
  total_strikes: number;
  // Include array of activities
  activities: {
    activity_id: number;
    activity_name: string;
    activity_date: string;
    activity_time: string;
    activity_duration: number;
  }[];
}

function StatsPage() {
  const [loading, setLoading] = useState<boolean>(true);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  useEffect(() => {
    // Get username from URL params or use default
    const fetchUserData = async () => {
      try {
        const userData = await fetch(
          `https://leaderboardrankings-1.onrender.com/activities`
        );
        const data = await userData.json();

        const playersData = data.player;
        const activitiesData = data.activities;
        const sessionsData = data.sessions;
        const sessionActivitiesData = data.session_activities;

        let displaySessions: DisplaySession[] = [];

        for (let i = 0; i < sessionActivitiesData.length; i++) {
          let sessionActivity = sessionActivitiesData[i];

          const session = sessionsData.find(
            (session: Session) =>
              session.session_id === sessionActivity.session_id
          );

          // Skip this iteration if the session is not found
          if (!session) {
            console.warn(
              `Session with ID ${sessionActivity.session_id} not found`
            );
            continue;
          }

          const activities = activitiesData.filter(
            (activity: Activity) =>
              activity.activity_id === sessionActivity.activity_id
          );

          let displaySession: DisplaySession = {
            session_id: sessionActivity.session_id,
            station_number: session.station_number,
            avg_react_time: session.avg_react_time,
            total_hits: session.total_hits,
            total_miss_hits: session.total_miss_hits,
            total_strikes: session.total_strikes,
            activities: activities,
          };

          displaySessions.push(displaySession);
        }

        // Calculate stats for user data
        const bestReactionTime =
          sessionsData.length > 0
            ? Math.min(...sessionsData.map((s: Session) => s.avg_react_time))
            : 0;
        const avgReactionTime =
          sessionsData.length > 0
            ? sessionsData.reduce(
                (sum: number, s: Session) => sum + s.avg_react_time,
                0
              ) / sessionsData.length
            : 0;

        const userData1: UserData = {
          username: playersData.username,
          total_sessions: sessionsData.length,
          bestReactionTime,
          avgReactionTime,
          sessionHistory: displaySessions,
        };

        setUserData(userData1);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const calculateScore = (session: DisplaySession): number => {
    const totalDuration = session.activities.reduce(
      (sum, act) => sum + act.activity_duration,
      0
    );

    return (
      totalDuration + 10 * session.total_strikes + 15 * session.total_miss_hits
    );
  };

  if (notFound) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-dark text-light">
        {/* Back Button */}
        <div className="container py-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline-secondary d-inline-flex align-items-center"
          >
            <ArrowLeft size={20} className="me-2" />
            Back
          </button>
        </div>

        {/* Not Found Content */}
        <div className="container flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center py-5">
          <div className="mb-4">
            <AlertCircle size={80} className="text-danger" />
          </div>
          <h1 className="display-4 fw-bold mb-3">Player Not Found</h1>
          <p className="lead text-secondary mb-4">
            We couldn't find any data for this player. Please check the username
            and try again.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-light btn-lg px-4 py-2"
          >
            Return to Homepage
          </button>
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

  if (loading) {
    return (
      <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-light me-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="fs-4">Loading user data...</div>
      </div>
    );
  }
  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light">
      {/* Back Button */}
      <div className="container py-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary d-inline-flex align-items-center"
        >
          <ArrowLeft size={20} className="me-2" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="container mb-5">
        {/* User Stats Header */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h1 className="card-title display-6 fw-bold mb-4">
              {username}'s Performance Stats
            </h1>

            {/* Stats Summary */}
            <div className="row g-4 mt-2">
              <div className="col-md-4">
                <div className="card bg-dark border-0 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="bg-light rounded-circle p-3 me-3 d-flex justify-content-center align-items-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <Target size={28} className="text-dark" />
                    </div>
                    <div>
                      <h6 className="text-secondary mb-1 text-white">
                        Total Sessions
                      </h6>
                      <h3 className="fw-bold mb-0 text-white">
                        {userData?.sessionHistory.length || 0}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card bg-dark border-0 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="bg-light rounded-circle p-3 me-3 d-flex justify-content-center align-items-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <Clock size={28} className="text-dark" />
                    </div>
                    <div>
                      <h6 className="text-secondary mb-1 text-white">
                        Best Reaction Time
                      </h6>
                      <h3 className="fw-bold mb-0 text-white">
                        {userData?.bestReactionTime.toFixed(2)} ms
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card bg-dark border-0 h-100">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="bg-light rounded-circle p-3 me-3 d-flex justify-content-center align-items-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <Award size={28} className="text-dark" />
                    </div>
                    <div>
                      <h6 className="text-secondary mb-1 text-white">
                        Average Reaction Time
                      </h6>
                      <h3 className="fw-bold mb-0 text-white">
                        {userData?.avgReactionTime.toFixed(2)} ms
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reaction Time Chart */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h2 className="card-title h4 fw-bold mb-4">Reaction Time Trend</h2>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userData?.sessionHistory.map((session) => ({
                    sessionId: session.session_id,
                    avgReactionTime: session.avg_react_time,
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="sessionId"
                    stroke="#aaa"
                    domain={["dataMin", "dataMax"]}
                    tickCount={userData?.sessionHistory.length || 5}
                  />
                  <YAxis stroke="#aaa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#222",
                      borderColor: "#444",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgReactionTime"
                    stroke="#0dcaf0"
                    strokeWidth={2}
                    dot={{ fill: "#0dcaf0", strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                    name="Avg. Reaction Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Session History Table */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h2 className="card-title h4 fw-bold mb-4">Session History</h2>
            <div className="table-responsive">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Station</th>
                    <th>Date</th>
                    <th>Activities</th>
                    <th>Duration (sec)</th>
                    <th>Avg Reaction (ms)</th>
                    <th>Hits/Misses</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {userData?.sessionHistory.map((session) => {
                    // Get the most recent activity date to represent the session date
                    const mostRecentActivity =
                      session.activities.length > 0
                        ? session.activities.sort(
                            (a, b) =>
                              new Date(b.activity_date).getTime() -
                              new Date(a.activity_date).getTime()
                          )[0]
                        : null;

                    // Calculate total duration across all activities
                    const totalDuration = session.activities.reduce(
                      (sum, act) => sum + act.activity_duration,
                      0
                    );

                    return (
                      <tr key={session.session_id}>
                        <td>{session.session_id}</td>
                        <td>{session.station_number}</td>
                        <td>{mostRecentActivity?.activity_date || "N/A"}</td>
                        <td>
                          {session.activities.length > 0
                            ? session.activities.map((act) => (
                                <div key={act.activity_id} className="mb-1">
                                  {act.activity_name}
                                </div>
                              ))
                            : "No activities"}
                        </td>
                        <td>{totalDuration}</td>
                        <td>{session.avg_react_time.toFixed(2)}</td>
                        <td>
                          {session.total_hits}/{session.total_miss_hits}
                        </td>
                        <td className="fw-bold">{calculateScore(session)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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

export default StatsPage;
