import React, { useState, useEffect } from "react";
import { ArrowLeft, Activity, User, Award, Target, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useLanguage } from "./LanguageContext";

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

// Visual cue data interface
interface VisualCueData {
  cue_order: number;
  visual_cue_time: number;
  visual_cue_color: string;
  activity_name: string;
  section_number: string;
  session_activity_id?: string;
}

// Visual cues response from API
interface VisualCuesResponse {
  sessionId: string;
  sections: Record<string, VisualCueData[]>;
  combinedCues: VisualCueData[];
  playerName?: string;
  date?: string;
}

// Update props interface to match DisplaySession
interface SessionDetailsProps {
  session: {
    session_id: number;
    avg_react_time: number;
    total_hits: number;
    total_miss_hits: number;
    total_strikes: number;
    session_time: string;
    session_date: string;
    duration: number;
    activities: ActivityData[];
  };
  onBack: () => void;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ session, onBack }) => {
  const { t, language } = useLanguage();
  const [visualCuesData, setVisualCuesData] =
    useState<VisualCuesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to safely format numbers

  // Fetch visual cues with error handling
  useEffect(() => {
    const fetchVisualCues = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://leaderboardrankings-serveur.onrender.com/${session.session_id}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError(
              t.noVisualCuesFound ||
                "No visual cues data found for this session"
            );
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } else {
          const data = await response.json();
          setVisualCuesData(data);
        }
      } catch (error) {
        console.error("Error fetching visual cues:", error);
        setError(t.failedToLoadVisualCues || "Failed to load visual cues data");
      } finally {
        setLoading(false);
      }
    };

    fetchVisualCues();
  }, [session.session_id, t]);

  // Group visual cues by section number
  const groupCuesBySection = () => {
    if (!visualCuesData || !visualCuesData.combinedCues) return {};

    return visualCuesData.combinedCues.reduce((acc, cue) => {
      const sectionKey = `${t.section || "Section"} ${cue.section_number}`;
      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }
      acc[sectionKey].push(cue);
      return acc;
    }, {} as Record<string, VisualCueData[]>);
  };

  // Get organized sections
  const organizedSections = visualCuesData ? groupCuesBySection() : {};

  // Calculate performance metrics
  const calculateAccuracy = () => {
    const totalAttempts = session.total_hits + session.total_miss_hits;
    return totalAttempts > 0
      ? ((session.total_hits / totalAttempts) * 100).toFixed(1)
      : "0.0";
  };

  // Helper function to safely format numbers
  const formatNumber = (
    value: number | undefined,
    decimals: number = 1
  ): string => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return decimals === 0 ? "0" : "0.0";
    }
    return Number(value).toFixed(decimals);
  };

  // Helper function to format just the date
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

  const getPerformanceGrade = () => {
    const accuracy = parseFloat(calculateAccuracy());
    if (accuracy >= 90) return { grade: "A+", color: "text-success" };
    if (accuracy >= 80) return { grade: "A", color: "text-success" };
    if (accuracy >= 70) return { grade: "B", color: "text-info" };
    if (accuracy >= 60) return { grade: "C", color: "text-warning" };
    return { grade: "D", color: "text-danger" };
  };

  return (
    <div className="session-details-background">
      <div className="background-content">
        {/* Back Button */}
        <div className="container py-4">
          <button
            onClick={onBack}
            className="btn btn-outline-secondary d-inline-flex align-items-center"
          >
            <ArrowLeft size={20} className="me-2" />
            {t.backToStats || "Back to Stats"}
          </button>
        </div>

        {/* Main Content */}
        <div className="container mb-5">
          {/* Session details card */}
          <div className="card bg-black text-light border-0 shadow mb-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 fw-bold mb-4 d-flex align-items-center">
                <Activity size={24} className="me-2 text-info" />
                {t.session || "Session"} #{session.session_id}{" "}
                {t.sessionDetails || "Details"}
              </h2>

              <div className="row g-4">
                {/* Basic Info */}
                <div className="col-md-6">
                  <div className="bg-dark rounded p-3 h-100">
                    <h3 className="h5 fw-bold d-flex align-items-center mb-3">
                      <User size={18} className="me-2 text-info" />
                      {t.sessionInformation || "Session Information"}
                    </h3>
                    <div className="mb-2">
                      <span className="text-secondary">
                        {t.activityDate || "Date"}:{" "}
                      </span>
                      <span>{session.session_date || t.unknown}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-secondary">
                        {t.time || "Time"}:{" "}
                      </span>
                      <span>{session.session_time || t.unknown}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-secondary">
                        {t.activities || "Activities"}:{" "}
                      </span>
                      <span className="badge bg-info">
                        {session.activities.length}{" "}
                        {t.activities || "Activities"}
                      </span>
                    </div>
                    <div className="mb-0">
                      <span className="text-secondary">
                        {t.accuracy || "Accuracy"}:{" "}
                      </span>
                      <span
                        className={`fw-bold ${getPerformanceGrade().color}`}
                      >
                        {calculateAccuracy()}% ({getPerformanceGrade().grade})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="col-md-6">
                  <div className="bg-dark rounded p-3 h-100">
                    <h3 className="h5 fw-bold d-flex align-items-center mb-3">
                      <Award size={18} className="me-2 text-info" />
                      {t.performanceSummary || "Performance Summary"}
                    </h3>
                    <div className="row text-center g-2">
                      <div className="col-6 col-lg-3 mb-2">
                        <div className="bg-black rounded p-2">
                          <div className="small text-secondary">
                            {t.duration || "Duration"}
                          </div>
                          <div className="fw-bold text-info">
                            {formatNumber(session.duration)}
                            {t.seconds || "s"}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-lg-3 mb-2">
                        <div className="bg-black rounded p-2">
                          <div className="small text-secondary">
                            {t.totalHits || "Hits"}
                          </div>
                          <div className="fw-bold text-success">
                            {session.total_hits || 0}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-lg-3 mb-2">
                        <div className="bg-black rounded p-2">
                          <div className="small text-secondary">
                            {t.missHits || "Misses"}
                          </div>
                          <div className="fw-bold text-danger">
                            {session.total_miss_hits || 0}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-lg-3 mb-2">
                        <div className="bg-black rounded p-2">
                          <div className="small text-secondary">
                            {t.strikes || "Strikes"}
                          </div>
                          <div className="fw-bold text-warning">
                            {session.total_strikes || 0}
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="bg-black rounded p-2">
                          <div className="small text-secondary">
                            {t.avgReactionTime || "Avg Reaction Time"}
                          </div>
                          <div className="fw-bold text-info">
                            {formatNumber(session.avg_react_time, 0)}{" "}
                            {t.milliseconds || "ms"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Cues Section */}
          {loading ? (
            <div className="card bg-black text-light border-0 shadow mb-4">
              <div className="card-body p-4">
                <h2 className="card-title h4 fw-bold mb-4">
                  <Clock size={20} className="me-2" />
                  {t.visualCues || "Visual Cues"}
                </h2>
                <div className="d-flex justify-content-center my-3">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">
                      {t.loadingVisualCues || "Loading visual cues..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="card bg-black text-light border-0 shadow mb-4">
              <div className="card-body p-4">
                <h2 className="card-title h4 fw-bold mb-4">
                  <Clock size={20} className="me-2" />
                  {t.visualCues || "Visual Cues"}
                </h2>
                <div className="alert alert-warning" role="alert">
                  <strong>{t.note || "Note"}:</strong> {error}
                </div>
              </div>
            </div>
          ) : visualCuesData &&
            visualCuesData.combinedCues &&
            visualCuesData.combinedCues.length > 0 ? (
            <div className="card bg-black text-light border-0 shadow mb-4">
              <div className="card-body p-4">
                <h2 className="card-title h4 fw-bold mb-4">
                  <Clock size={20} className="me-2" />
                  {t.visualCuesBySection || "Visual Cues by Section"}
                </h2>

                {/* Visual Cues Timeline Graph */}
                <div className="mb-4">
                  <h3 className="h5 fw-bold text-info mb-3">
                    {t.timeline || "Timeline"}
                  </h3>
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={visualCuesData.combinedCues
                          .map((cue) => ({
                            name: `S${cue.section_number}-${cue.cue_order}`,
                            time: cue.visual_cue_time,
                            value: parseInt(cue.section_number),
                            section: `${t.section || "Section"} ${
                              cue.section_number
                            }`,
                            cue_order: cue.cue_order,
                            color: cue.visual_cue_color,
                          }))
                          .sort((a, b) => {
                            if (a.value !== b.value) {
                              return a.value - b.value;
                            }
                            return a.cue_order - b.cue_order;
                          })}
                        margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="time"
                          name={t.time || "Time"}
                          unit=" ms"
                          stroke="#aaa"
                          domain={[0, "dataMax"]}
                        />
                        <YAxis
                          dataKey="value"
                          name={t.section || "Section"}
                          stroke="#aaa"
                          ticks={[
                            ...new Set(
                              visualCuesData.combinedCues.map((cue) =>
                                parseInt(cue.section_number)
                              )
                            ),
                          ].sort((a, b) => a - b)}
                          tickFormatter={(value) =>
                            `${t.section || "Section"} ${value}`
                          }
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div
                                  className="custom-tooltip"
                                  style={{
                                    backgroundColor: "#222",
                                    padding: "10px",
                                    border: "1px solid #444",
                                    borderRadius: "5px",
                                  }}
                                >
                                  <p className="label text-light">{`${
                                    t.section || "Section"
                                  } ${data.value} - ${t.cue || "Cue"} #${
                                    data.cue_order
                                  }`}</p>
                                  <p className="desc text-info">{`${
                                    t.time || "Time"
                                  }: ${data.time} ${
                                    t.milliseconds || "ms"
                                  }`}</p>
                                  <p className="desc text-light">{`${
                                    t.color || "Color"
                                  }: ${data.color || "N/A"}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0dcaf0"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          name={t.sectionSequence || "Section Sequence"}
                          dot={(props) => {
                            const { cx, cy, payload } = props;
                            const dotColor = payload.color || "#0dcaf0";
                            return (
                              <g>
                                <circle cx={cx} cy={cy} r={8} fill={dotColor} />
                                <text
                                  x={cx}
                                  y={cy}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#fff"
                                  fontSize={10}
                                  fontWeight="bold"
                                >
                                  {payload.cue_order}
                                </text>
                              </g>
                            );
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Section Tables */}
                {Object.entries(organizedSections)
                  .sort((a, b) => {
                    const sectionA = parseInt(a[0].match(/\d+/)?.[0] || "0");
                    const sectionB = parseInt(b[0].match(/\d+/)?.[0] || "0");
                    return sectionA - sectionB;
                  })
                  .map(([sectionName, cues]) => (
                    <div key={sectionName} className="mb-4">
                      <h3 className="h5 fw-bold text-info mb-3">
                        {sectionName} ({cues.length} {t.cues || "cues"})
                      </h3>
                      <div className="table-responsive">
                        <table className="table table-dark table-hover">
                          <thead>
                            <tr>
                              <th>{t.order || "Order"}</th>
                              <th>
                                {t.time || "Time"} ({t.milliseconds || "ms"})
                              </th>
                              <th>{t.color || "Color"}</th>
                              <th>{t.activityName || "Activity"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cues
                              .sort((a, b) => a.cue_order - b.cue_order)
                              .map((cue) => (
                                <tr key={`${sectionName}-${cue.cue_order}`}>
                                  <td>{cue.cue_order}</td>
                                  <td>{cue.visual_cue_time}</td>
                                  <td>
                                    <span
                                      className="color-sample d-inline-block me-2"
                                      style={{
                                        backgroundColor:
                                          cue.visual_cue_color || "#ccc",
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "4px",
                                      }}
                                    ></span>
                                    {cue.visual_cue_color || "N/A"}
                                  </td>
                                  <td>{cue.activity_name}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}

          {/* Activities Table */}
          <div className="card bg-black text-light border-0 shadow mb-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 fw-bold mb-4">
                <Target size={20} className="me-2" />
                {t.activityDetails || "Activity Details"}
              </h2>

              <div className="table-responsive">
                <table className="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th>{t.activityName || "Activity"}</th>
                      <th>
                        {t.activityDate || "Date"}/{t.time || "Time"}
                      </th>
                      <th>{t.duration || "Duration"}</th>
                      <th>{t.totalHits || "Hits"}</th>
                      <th>{t.missHits || "Misses"}</th>
                      <th>{t.avgReactionTime || "Reaction Time"}</th>
                      <th>{t.strikes || "Strikes"}</th>
                      <th>{t.accuracy || "Accuracy"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.activities.map((activity, index) => {
                      const accuracy =
                        activity.activity_hits + activity.activity_miss_hits > 0
                          ? (
                              (activity.activity_hits /
                                (activity.activity_hits +
                                  activity.activity_miss_hits)) *
                              100
                            ).toFixed(1)
                          : "0.0";

                      return (
                        <tr key={index}>
                          <td>
                            <span className="badge bg-info">
                              {activity.activity_name || t.unknown}
                            </span>
                          </td>
                          <td className="small">
                            <div>{formatDate(activity.activity_date)}</div>
                            <div className="text-white">
                              {session.session_time}
                            </div>
                          </td>
                          <td>
                            {formatNumber(activity.activity_duration)}
                            {t.seconds || "s"}
                          </td>
                          <td className="text-success">
                            {activity.activity_hits || 0}
                          </td>
                          <td className="text-danger">
                            {activity.activity_miss_hits || 0}
                          </td>
                          <td>
                            {formatNumber(activity.activity_avg_react_time, 0)}{" "}
                            {t.milliseconds || "ms"}
                          </td>
                          <td className="text-warning">
                            {activity.activity_strikes || 0}
                          </td>
                          <td className="fw-bold">{accuracy}%</td>
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
        <footer className="bg-transparent text-center py-4 mt-auto border-top border-secondary">
          <p className="text-light mb-0">
            © 2025{" "}
            {t.airstoftTracker || "Airsoft Tracker | LA ZONE Training System"}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SessionDetails;
