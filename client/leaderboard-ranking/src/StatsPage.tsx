import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, Award } from "lucide-react";
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

// Define interface for session data
interface SessionData {
  sessionId: number;
  date: string;
  time: string;
  avgReactionTime: number;
  activityDuration: number;
  totalStrikes: number;
  totalMiss: number;
}

// Define interface for user data
interface UserData {
  username: string;
  totalSessions: number;
  bestReactionTime: number;
  avgReactionTime: number;
  sessionHistory: SessionData[];
}

const StatsPage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { username: urlUsername } = useParams<{ username: string }>();

  useEffect(() => {
    // Get username from URL params or use default
    const user = urlUsername || "AOD23";

    // Simulate fetching data
    setTimeout(() => {
      // This would be an API call in a real app
      const mockUserData: UserData = {
        username: user,
        totalSessions: 47,
        bestReactionTime: 684, // ms
        avgReactionTime: 2390, // ms
        sessionHistory: processCSVData(),
      };
      setUserData(mockUserData);
      setLoading(false);
    }, 1000);
  }, [urlUsername]);

  // Function to process the CSV data
  const processCSVData = (): SessionData[] => {
    // This would process the actual CSV data in a real app
    // For now, using sample data based on the provided CSV
    return [
      {
        sessionId: 1,
        date: "2024-09-21",
        time: "12:11:21",
        avgReactionTime: 753,
        activityDuration: 11,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 2,
        date: "2024-09-21",
        time: "12:10:26",
        avgReactionTime: 845,
        activityDuration: 12,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 3,
        date: "2024-09-21",
        time: "12:09:54",
        avgReactionTime: 930,
        activityDuration: 13,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 4,
        date: "2024-09-21",
        time: "12:09:22",
        avgReactionTime: 1026,
        activityDuration: 14,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 5,
        date: "2024-09-21",
        time: "12:06:22",
        avgReactionTime: 969,
        activityDuration: 14,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 6,
        date: "2024-09-21",
        time: "12:05:52",
        avgReactionTime: 1057,
        activityDuration: 15,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 7,
        date: "2024-09-21",
        time: "12:03:56",
        avgReactionTime: 693,
        activityDuration: 10,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 8,
        date: "2024-09-21",
        time: "12:00:42",
        avgReactionTime: 741,
        activityDuration: 11,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 9,
        date: "2024-09-21",
        time: "11:58:00",
        avgReactionTime: 1370,
        activityDuration: 19,
        totalStrikes: 0,
        totalMiss: 0,
      },
      {
        sessionId: 10,
        date: "2024-09-21",
        time: "11:57:17",
        avgReactionTime: 1012,
        activityDuration: 14,
        totalStrikes: 0,
        totalMiss: 0,
      },
    ]; // No need to reverse, keep in ascending order
  };

  // Calculate score based on the formula provided
  const calculateScore = (session: SessionData): number => {
    return (
      session.activityDuration +
      10 * session.totalStrikes +
      15 * session.totalMiss
    );
  };

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
              {userData?.username}'s Performance Stats
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
                        {userData?.totalSessions}
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
                        {userData?.bestReactionTime} ms
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
                        {userData?.avgReactionTime} ms
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
                  data={userData?.sessionHistory}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="sessionId"
                    stroke="#aaa"
                    domain={[1, 10]}
                    tickCount={userData?.sessionHistory.length}
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
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration (sec)</th>
                    <th>Avg Reaction (ms)</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {userData?.sessionHistory.map((session) => (
                    <tr key={session.sessionId}>
                      <td>{session.date}</td>
                      <td>{session.time}</td>
                      <td>{session.activityDuration}</td>
                      <td>{session.avgReactionTime}</td>
                      <td className="fw-bold">{calculateScore(session)}</td>
                    </tr>
                  ))}
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
};

export default StatsPage;
