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
import SessionDetails from "./SessionDetails";
import { useLanguage } from "./LanguageContext";
import "./Backgrounds.css";

interface ActivityData {
  session_id: number;
  activity_date: string;
  activity_time: string;
  activity_name: string;
  activity_duration: number;
  activity_hits: number;
  activity_miss_hits: number;
  activity_avg_react_time: number;
  activity_strikes: number;
}

interface UserData {
  username: string;
  total_sessions: number;
  bestReactionTime: number;
  avgReactionTime: number;
  sessionHistory: DisplaySession[];
}

interface DisplaySession {
  session_id: number;
  avg_react_time: number;
  total_hits: number;
  total_miss_hits: number;
  total_strikes: number;
  session_time: string;
  session_date: string;
  duration: number;
  activities: ActivityData[];
}

function StatsPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<DisplaySession | null>(
    null
  );
  const [showSessionDetails, setShowSessionDetails] = useState<boolean>(false);
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return t.unknown || "Unknown";

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return t.unknown || "Unknown";
      }

      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };

      const locale = language === "fr" ? "fr-FR" : "en-US";
      return date.toLocaleDateString(locale, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return t.unknown || "Unknown";
    }
  };

  // Helper function to format time

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://leaderboardrankings-serveur.onrender.com/${username}`
        );

        if (!response.ok) {
          throw new Error("User not found or API error");
        }

        const activityData = await response.json();

        if (!activityData || activityData.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Group activities by session_id
        const sessionMap = new Map<number, ActivityData[]>();
        activityData.forEach((activity: ActivityData) => {
          if (!sessionMap.has(activity.session_id)) {
            sessionMap.set(activity.session_id, []);
          }
          sessionMap.get(activity.session_id)!.push(activity);
        });

        // Create session history from grouped activities
        const displaySessions: DisplaySession[] = [];

        sessionMap.forEach((activities, sessionId) => {
          // Calculate session averages and totals
          const totalHits = activities.reduce(
            (sum, act) => sum + act.activity_hits,
            0
          );
          const totalMissHits = activities.reduce(
            (sum, act) => sum + act.activity_miss_hits,
            0
          );
          const totalStrikes = activities.reduce(
            (sum, act) => sum + act.activity_strikes,
            0
          );
          const totalDuration = activities.reduce(
            (sum, act) => sum + act.activity_duration,
            0
          );

          // Average reaction time weighted by number of hits
          const totalHitsForAvg = activities.reduce(
            (sum, act) => sum + act.activity_hits,
            0
          );
          const weightedReactTime = activities.reduce(
            (sum, act) => sum + act.activity_avg_react_time * act.activity_hits,
            0
          );
          const avgReactTime =
            totalHitsForAvg > 0 ? weightedReactTime / totalHitsForAvg : 0;

          // Use the date and time from the first activity in the session
          const firstActivity = activities[0];

          const displaySession: DisplaySession = {
            session_id: sessionId,
            avg_react_time: avgReactTime,
            total_hits: totalHits,
            total_miss_hits: totalMissHits,
            total_strikes: totalStrikes,
            session_time: firstActivity.activity_time,
            session_date: firstActivity.activity_date, // Keep as ISO string for formatting
            duration: totalDuration,
            activities: activities,
          };

          displaySessions.push(displaySession);
        });

        // Sort sessions by session_id (most recent first)
        displaySessions.sort((a, b) => b.session_id - a.session_id);

        // Calculate user stats
        const bestReactionTime =
          displaySessions.length > 0
            ? Math.min(...displaySessions.map((s) => s.avg_react_time))
            : 0;

        const avgReactionTime =
          displaySessions.length > 0
            ? displaySessions.reduce((sum, s) => sum + s.avg_react_time, 0) /
              displaySessions.length
            : 0;

        // Create user data object
        const userData: UserData = {
          username: username || "Player",
          total_sessions: displaySessions.length,
          bestReactionTime,
          avgReactionTime,
          sessionHistory: displaySessions,
        };

        setUserData(userData);
      } catch (error) {
        console.error("Error processing user data:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const calculateScore = (session: DisplaySession): number => {
    return (
      session.duration +
      10 * session.total_strikes +
      15 * session.total_miss_hits
    );
  };

  const handleSessionClick = (session: DisplaySession) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const handleBackToStats = () => {
    setShowSessionDetails(false);
    setSelectedSession(null);
  };

  if (notFound) {
    return (
      <div className="stats-background">
        <div className="background-content">
          <div className="container py-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary d-inline-flex align-items-center"
            >
              <ArrowLeft size={20} className="me-2" />
              {t.backToHome}
            </button>
          </div>

          <div className="container flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center py-5">
            <div className="mb-4">
              <AlertCircle size={80} className="text-danger" />
            </div>
            <h1 className="display-4 fw-bold mb-3 text-white">
              {t.userNotFound}
            </h1>
            <p className="lead text-light mb-4">{t.noDataFound}</p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-light btn-lg px-4 py-2"
            >
              {t.backToHome}
            </button>
          </div>

          <footer className="bg-transparent text-center py-4 mt-auto border-top border-secondary">
            <p className="text-light mb-0">{t.airstoftTracker}</p>
          </footer>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="stats-background">
        <div className="background-content">
          <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div className="spinner-border text-light me-3" role="status">
                <span className="visually-hidden">{t.loading}</span>
              </div>
              <div className="fs-4 text-light">{t.loadingUserData}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSessionDetails && selectedSession) {
    return (
      <SessionDetails session={selectedSession} onBack={handleBackToStats} />
    );
  }

  return (
    <div className="stats-background">
      <div className="background-content">
        <div className="container py-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline-secondary d-inline-flex align-items-center"
          >
            <ArrowLeft size={20} className="me-2" />
            {t.backToHome}
          </button>
        </div>

        <div className="container mb-5">
          {/* User Stats Header */}
          <div className="card transparent-card border-0 shadow mb-4">
            <div className="card-body p-4">
              <h1 className="card-title display-6 fw-bold mb-4 text-white">
                {username}'s {t.playerStats}
              </h1>

              {/* Stats Summary */}
              <div className="row g-4 mt-2">
                <div className="col-md-4">
                  <div className="card transparent-card border-0 h-100">
                    <div className="card-body d-flex align-items-center">
                      <div
                        className="bg-light rounded-circle p-3 me-3 d-flex justify-content-center align-items-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <Target size={28} className="text-dark" />
                      </div>
                      <div>
                        <h6 className="text-secondary mb-1 text-white">
                          {t.totalSessions}
                        </h6>
                        <h3 className="fw-bold mb-0 text-white">
                          {userData?.sessionHistory.length || 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card transparent-card border-0 h-100">
                    <div className="card-body d-flex align-items-center">
                      <div
                        className="bg-light rounded-circle p-3 me-3 d-flex justify-content-center align-items-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <Clock size={28} className="text-dark" />
                      </div>
                      <div>
                        <h6 className="text-secondary mb-1 text-white">
                          {t.bestTime}
                        </h6>
                        <h3 className="fw-bold mb-0 text-white">
                          {userData?.bestReactionTime.toFixed(2)} ms
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card transparent-card border-0 h-100">
                    <div className="card-body d-flex align-items-center">
                      <div
                        className="bg-light rounded-circle p-3 me-3 d-flex justify-content-center align-items-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <Award size={28} className="text-dark" />
                      </div>
                      <div>
                        <h6 className="text-secondary mb-1 text-white">
                          {t.avgReaction}
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
          <div className="card transparent-card border-0 shadow mb-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 fw-bold mb-4 text-white">
                Reaction Time Trend
              </h2>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userData?.sessionHistory
                      .slice()
                      .reverse()
                      .map((session) => ({
                        sessionId: session.session_id,
                        avgReactionTime: Math.round(session.avg_react_time),
                      }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="sessionId" stroke="#aaa" />
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
          <div className="card transparent-card border-0 shadow mb-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 fw-bold mb-4 text-white">
                {t.sessionDetails}
              </h2>
              <div className="table-responsive">
                <table className="table table-dark table-hover transparent-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>Date</th>
                      <th>{t.time}</th>
                      <th>{t.duration} (sec)</th>
                      <th>{t.avgReaction} (ms)</th>
                      <th>{t.hitsMisses}</th>
                      <th>Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData?.sessionHistory.map((session) => (
                      <tr key={session.session_id}>
                        <td>{session.session_id}</td>
                        <td>{formatDate(session.session_date)}</td>
                        <td>{session.session_time}</td>
                        <td>{session.duration}</td>
                        <td>{session.avg_react_time.toFixed(2)}</td>
                        <td>
                          {session.total_hits}/{session.total_miss_hits}
                        </td>
                        <td className="fw-bold">{calculateScore(session)}</td>
                        <td>
                          <button
                            onClick={() => handleSessionClick(session)}
                            className="btn btn-sm btn-outline-info"
                          >
                            {t.viewDetails}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-transparent text-center py-4 mt-auto border-top border-secondary">
          <p className="text-light mb-0">{t.airstoftTracker}</p>
        </footer>
      </div>
    </div>
  );
}

export default StatsPage;
