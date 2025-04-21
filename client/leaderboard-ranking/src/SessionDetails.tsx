import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ZAxis,
  Legend,
} from "recharts";

// Define interface for visual cue data
interface VisualCueData {
  cue_order: number;
  visual_cue_time: number;
  activity_name: string;
}

// Define interface for activity data coming from JSON
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

// Define interface for session data
interface DisplaySession {
  session_id: number;
  station_number: number;
  avg_react_time: number;
  total_hits: number;
  total_miss_hits: number;
  total_strikes: number;
  session_time: string;
  session_date: string;
  duration: number;
  activities: ActivityData[]; // Store full activity data
}

interface SessionDetailsProps {
  session: DisplaySession;
  onBack: () => void;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ session, onBack }) => {
  const [visualCues, setVisualCues] = useState<VisualCueData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setVisualCues(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching visual cues:", error);
        setError("Failed to load visual cues data");
        setLoading(false);
      }
    };

    fetchVisualCues();
  }, [session.session_id]);

  // Group visual cues by activity name
  const groupedCues = visualCues.reduce((acc, cue) => {
    if (!acc[cue.activity_name]) {
      acc[cue.activity_name] = [];
    }
    acc[cue.activity_name].push(cue);
    return acc;
  }, {} as Record<string, VisualCueData[]>);

  // Prepare sequential data - sort by activity name (Pablo1, Pablo2, Pablo3) and then by cue_order
  const sortedCues = [...visualCues].sort((a, b) => {
    // First sort by activity name
    const activityPriority = {
      Pablo1: 1,
      Pablo2: 2,
      Pablo3: 3,
    };

    const aPriority =
      activityPriority[a.activity_name as keyof typeof activityPriority] || 999;
    const bPriority =
      activityPriority[b.activity_name as keyof typeof activityPriority] || 999;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Then sort by cue_order within the same activity
    return a.cue_order - b.cue_order;
  });

  // Prepare data for the line chart
  const lineChartData = sortedCues.map((cue, index) => ({
    name: `${cue.activity_name}-${cue.cue_order}`,
    time: cue.visual_cue_time,
    value:
      cue.activity_name === "Pablo1"
        ? 1
        : cue.activity_name === "Pablo2"
        ? 2
        : 3,
    activity: cue.activity_name,
    cue_order: cue.cue_order,
    index: index, // For sequential ordering
  }));

  // Prepare data for the scatter chart (same as before)
  const scatterChartData = visualCues.map((cue) => ({
    x: cue.visual_cue_time,
    y:
      cue.activity_name === "Pablo1"
        ? 1
        : cue.activity_name === "Pablo2"
        ? 2
        : 3, // Y position based on activity
    z: 10, // Size of the dot
    cue_order: cue.cue_order,
    activity_name: cue.activity_name,
  }));

  // For the activity names as Y-axis values
  const activityNames = [
    ...new Set(visualCues.map((cue) => cue.activity_name)),
  ].sort((a, b) => {
    // Ensure Pablo1, Pablo2, Pablo3 order
    const order = { Pablo1: 1, Pablo2: 2, Pablo3: 3 };
    return (
      (order[a as keyof typeof order] || 999) -
      (order[b as keyof typeof order] || 999)
    );
  });

  const yAxisTicks = activityNames.map((name, index) => index + 1);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
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
            data.activity || data.activity_name
          } - Cue #${data.cue_order}`}</p>
          <p className="desc text-info">{`Time: ${data.time || data.x} ms`}</p>
        </div>
      );
    }
    return null;
  };

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
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h1 className="card-title h3 fw-bold mb-4">
              Session #{session.session_id} Details
            </h1>

            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="text-secondary">Session Date</h6>
                <p className="h5">{session.session_date}</p>
              </div>
              <div className="col-md-6">
                <h6 className="text-secondary">Session Time</h6>
                <p className="h5">{session.session_time}</p>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <h6 className="text-secondary">Station</h6>
                <p className="h5">{session.station_number}</p>
              </div>
              <div className="col-md-4">
                <h6 className="text-secondary">Total Duration</h6>
                <p className="h5">{session.duration} sec</p>
              </div>
              <div className="col-md-4">
                <h6 className="text-secondary">Avg Reaction Time</h6>
                <p className="h5">{session.avg_react_time.toFixed(2)} ms</p>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <h6 className="text-secondary">Total Hits</h6>
                <p className="h5">{session.total_hits}</p>
              </div>
              <div className="col-md-4">
                <h6 className="text-secondary">Total Misses</h6>
                <p className="h5">{session.total_miss_hits}</p>
              </div>
              <div className="col-md-4">
                <h6 className="text-secondary">Total Strikes</h6>
                <p className="h5">{session.total_strikes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Cues Line Chart - NEW */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h2 className="card-title h4 fw-bold mb-4">
              <Clock size={20} className="me-2" />
              Visual Cues Sequential Timeline
            </h2>

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineChartData}
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
                      name="Activity"
                      stroke="#aaa"
                      ticks={yAxisTicks}
                      tickFormatter={(value) => {
                        const index = Math.floor(value) - 1;
                        return index >= 0 && index < activityNames.length
                          ? activityNames[index]
                          : "";
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0dcaf0"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      name="Activity Sequence"
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        return (
                          <g>
                            <circle cx={cx} cy={cy} r={8} fill="#0dcaf0" />
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
            )}
          </div>
        </div>

        {/* Original Visual Cues Scatter Chart */}

        {/* Activities Table */}
        <div className="card bg-black text-light border-0 shadow mb-4">
          <div className="card-body p-4">
            <h2 className="card-title h4 fw-bold mb-4">
              Activities in this Session
            </h2>
            <div className="table-responsive">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Duration</th>
                    <th>Reaction Time</th>
                    <th>Hits</th>
                    <th>Misses</th>
                    <th>Strikes</th>
                  </tr>
                </thead>
                <tbody>
                  {session.activities.map((activity, index) => (
                    <tr key={index}>
                      <td>{activity.activity_name}</td>
                      <td>{activity.activity_duration} sec</td>
                      <td>{activity.activity_avg_react_time} ms</td>
                      <td>{activity.activity_hits}</td>
                      <td>{activity.activity_miss_hits}</td>
                      <td>{activity.activity_strikes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mb-4">
          <button
            type="button"
            className="btn btn-primary"
            title="Export session data"
          >
            Export Data
          </button>
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
