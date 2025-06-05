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

// Import the ActivityData interface to match your structure
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
  const [visualCuesData, setVisualCuesData] =
    useState<VisualCuesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch visual cues
  useEffect(() => {
    const fetchVisualCues = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/session/visualCues/${session.session_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch visual cues data");
        }
        const data = await response.json();
        setVisualCuesData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching visual cues:", error);
        setError("Failed to load visual cues data");
        setLoading(false);
      }
    };

    fetchVisualCues();
  }, [session.session_id]);

  // Group visual cues by section number instead of activity name
  const groupCuesBySection = () => {
    if (!visualCuesData || !visualCuesData.combinedCues) return {};

    return visualCuesData.combinedCues.reduce((acc, cue) => {
      const sectionKey = `Section ${cue.section_number}`;
      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }
      acc[sectionKey].push(cue);
      return acc;
    }, {} as Record<string, VisualCueData[]>);
  };

  // Get organized sections
  const organizedSections = visualCuesData ? groupCuesBySection() : {};

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light">
      {/* Back Button */}
      <div className="container py-4">
        <button
          onClick={onBack}
          className="btn btn-outline-secondary d-inline-flex align-items-center"
        >
          <ArrowLeft size={20} className="me-2" />
          Back to Stats
        </button>
      </div>

      {/* Main Content */}
      <div className="container mb-5">
        {/* Session details card */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h2 className="card-title h4 fw-bold mb-4 d-flex align-items-center">
              <Activity size={24} className="me-2 text-info" />
              Session #{session.session_id} Details
            </h2>

            <div className="row g-4">
              {/* Basic Info */}
              <div className="col-md-6">
                <div className="bg-dark rounded p-3 h-100">
                  <h3 className="h5 fw-bold d-flex align-items-center mb-3">
                    <User size={18} className="me-2 text-info" />
                    Session Information
                  </h3>
                  <div className="mb-2">
                    <span className="text-secondary">Date: </span>
                    <span>{session.session_date || "Unknown"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-secondary">Time: </span>
                    <span>{session.session_time || "Unknown"}</span>
                  </div>
                  <div className="mb-0">
                    <span className="text-secondary">Activities: </span>
                    <span className="badge bg-info">
                      {session.activities.length} Activities
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="col-md-6">
                <div className="bg-dark rounded p-3 h-100">
                  <h3 className="h5 fw-bold d-flex align-items-center mb-3">
                    <Award size={18} className="me-2 text-info" />
                    Performance Summary
                  </h3>
                  <div className="row text-center g-2">
                    <div className="col-6 col-lg-3 mb-2">
                      <div className="bg-black rounded p-2">
                        <div className="small text-secondary">Duration</div>
                        <div className="fw-bold text-info">
                          {formatNumber(session.duration)}s
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-lg-3 mb-2">
                      <div className="bg-black rounded p-2">
                        <div className="small text-secondary">Hits</div>
                        <div className="fw-bold text-success">
                          {session.total_hits || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-lg-3 mb-2">
                      <div className="bg-black rounded p-2">
                        <div className="small text-secondary">Misses</div>
                        <div className="fw-bold text-danger">
                          {session.total_miss_hits || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-lg-3 mb-2">
                      <div className="bg-black rounded p-2">
                        <div className="small text-secondary">Strikes</div>
                        <div className="fw-bold text-warning">
                          {session.total_strikes || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="bg-black rounded p-2">
                        <div className="small text-secondary">
                          Avg Reaction Time
                        </div>
                        <div className="fw-bold text-info">
                          {formatNumber(session.avg_react_time, 0)} ms
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Cues By Section Tables */}
        {loading ? (
          <div className="card bg-black text-light border-0 shadow mb-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 fw-bold mb-4">
                <Clock size={20} className="me-2" />
                Visual Cues
              </h2>
              <div className="d-flex justify-content-center my-3">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="card bg-black text-light border-0 shadow mb-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 fw-bold mb-4">
                <Clock size={20} className="me-2" />
                Visual Cues
              </h2>
              <div className="alert alert-danger">{error}</div>
            </div>
          </div>
        ) : visualCuesData && visualCuesData.combinedCues ? (
          <div className="card bg-black text-light border-0 shadow mb-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 fw-bold mb-4">
                <Clock size={20} className="me-2" />
                Visual Cues by Section
              </h2>

              {/* Visual Cues Timeline Graph */}
              <div className="mb-4">
                <h3 className="h5 fw-bold text-info mb-3">Timeline</h3>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={visualCuesData.combinedCues
                        .map((cue) => ({
                          name: `S${cue.section_number}-${cue.cue_order}`,
                          time: cue.visual_cue_time,
                          value: parseInt(cue.section_number),
                          section: `Section ${cue.section_number}`,
                          cue_order: cue.cue_order,
                          color: cue.visual_cue_color,
                        }))
                        .sort((a, b) => {
                          // First sort by section number
                          if (a.value !== b.value) {
                            return a.value - b.value;
                          }
                          // Then by cue_order
                          return a.cue_order - b.cue_order;
                        })}
                      margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="time"
                        name="Time"
                        unit=" ms"
                        stroke="#aaa"
                        domain={[0, "dataMax"]}
                      />
                      <YAxis
                        dataKey="value"
                        name="Section"
                        stroke="#aaa"
                        ticks={[
                          ...new Set(
                            visualCuesData.combinedCues.map((cue) =>
                              parseInt(cue.section_number)
                            )
                          ),
                        ].sort((a, b) => a - b)}
                        tickFormatter={(value) => `Section ${value}`}
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
                                <p className="label text-light">{`Section ${data.value} - Cue #${data.cue_order}`}</p>
                                <p className="desc text-info">{`Time: ${data.time} ms`}</p>
                                <p className="desc text-light">{`Color: ${
                                  data.color || "N/A"
                                }`}</p>
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
                        name="Section Sequence"
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          // Choose dot color based on the visual cue color if available
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

              {/* Display section tables - using the properly organized sections */}
              {Object.entries(organizedSections)
                .sort((a, b) => {
                  // Extract section numbers for proper sorting
                  const sectionA = parseInt(a[0].match(/\d+/)?.[0] || "0");
                  const sectionB = parseInt(b[0].match(/\d+/)?.[0] || "0");
                  return sectionA - sectionB;
                })
                .map(([sectionName, cues]) => (
                  <div key={sectionName} className="mb-4">
                    <h3 className="h5 fw-bold text-info mb-3">{sectionName}</h3>
                    <div className="table-responsive">
                      <table className="table table-dark table-hover">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Time (ms)</th>
                            <th>Color</th>
                            <th>Activity</th>
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
              Activity Details
            </h2>

            <div className="table-responsive">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Date/Time</th>
                    <th>Duration</th>
                    <th>Hits</th>
                    <th>Misses</th>
                    <th>Reaction Time</th>
                    <th>Strikes</th>
                  </tr>
                </thead>
                <tbody>
                  {session.activities.map((activity, index) => (
                    <tr key={index}>
                      <td>
                        <span className="badge bg-info">
                          {activity.activity_name || "Unknown"}
                        </span>
                      </td>
                      <td className="small">
                        {activity.activity_time || "Unknown"}
                      </td>
                      <td>{formatNumber(activity.activity_duration)}s</td>
                      <td className="text-success">
                        {activity.activity_hits || 0}
                      </td>
                      <td className="text-danger">
                        {activity.activity_miss_hits || 0}
                      </td>
                      <td>
                        {formatNumber(activity.activity_avg_react_time, 0)} ms
                      </td>
                      <td className="text-warning">
                        {activity.activity_strikes || 0}
                      </td>
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

export default SessionDetails;
