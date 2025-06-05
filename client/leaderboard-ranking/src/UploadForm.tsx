import { useState } from "react";

// Define proper TypeScript interfaces
interface VisualCue {
  time: string;
  color?: string;
}

interface Activity {
  activityDate: string;
  activityTime: string;
  activityName: string;
  durationType: string;
  durationHitCount: string;
  cycleDuration: string;
  activityDuration: string;
  lightLogic: string;
  stationNumber: string;
  cycleNumber: string;
  playerNumber: string;
  playerName: string;
  avgReactionTime: string;
  totalHits: string;
  totalMissHits: string;
  totalStrikes: string;
  repetitions: string;
  lightsOut: string;
  levels: string;
  steps: string;

  [key: string]: string | undefined;

  baseActivityType?: string;
  activityPrefix?: string;
}

interface GroupedSession {
  username: string;
  activities: Activity[];
}

function UploadForm() {
  const [csvData, setCsvData] = useState<Activity[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("csv", file);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const rawData: Activity[] = await response.json();

      // Process the data to add baseActivityType and activityPrefix
      const processedData = rawData.map((activity) => {
        const activityName = activity.activityName || "";
        let baseActivityType = "";
        let activityPrefix = "";

        // Extract the prefix (TD or EX) from the activity name
        const match = activityName.match(/^(TD|EX)/i);

        if (match) {
          activityPrefix = match[1].toUpperCase(); // "TD" or "EX"
        }

        // Use the station number directly from the CSV data
        if (activity.stationNumber) {
          baseActivityType = activity.stationNumber;
        }

        return {
          ...activity,
          baseActivityType,
          activityPrefix,
        };
      });

      console.log("Processed Data:", processedData);
      setCsvData(processedData);

      // Group activities into sessions
      const sessions = groupActivitiesIntoSessions(processedData);
      setGroupedData(sessions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading the file"
      );
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  }

  function groupActivitiesIntoSessions(
    activities: Activity[]
  ): GroupedSession[] {
    console.log("Grouping activities:", activities);

    // Filter out activities with invalid station numbers first
    const validActivities = activities.filter((activity) => {
      const sectionNumber = parseInt(activity.baseActivityType || "0");
      if (sectionNumber < 1 || sectionNumber > 3) {
        console.warn(
          `Filtering out activity ${activity.activityName} with invalid section ${sectionNumber}`
        );
        return false;
      }
      return !!activity.activityPrefix; // Also ensure we have a valid prefix
    });

    console.log(
      `Filtered ${
        activities.length - validActivities.length
      } invalid activities`
    );

    // Group by username first
    const userActivities: { [key: string]: Activity[] } = {};

    validActivities.forEach((activity) => {
      const username = activity.playerName;
      if (!username) return;

      if (!userActivities[username]) {
        userActivities[username] = [];
      }
      userActivities[username].push(activity);
    });

    const completeSessions: GroupedSession[] = [];

    // Process each user's activities
    Object.entries(userActivities).forEach(([username, userActs]) => {
      console.log(`Processing user: ${username}`, userActs);

      // Sort activities by date and time
      const sortedActivities = userActs.sort((a, b) => {
        const timeA = new Date(`${a.activityDate} ${a.activityTime}`).getTime();
        const timeB = new Date(`${b.activityDate} ${b.activityTime}`).getTime();
        return timeA - timeB;
      });

      // Group by prefix (TD or EX) and time frame
      const prefixGroups: { [key: string]: Activity[] } = {};

      sortedActivities.forEach((activity) => {
        if (activity.activityPrefix) {
          if (!prefixGroups[activity.activityPrefix]) {
            prefixGroups[activity.activityPrefix] = [];
          }
          prefixGroups[activity.activityPrefix].push(activity);
        }
      });

      console.log(`Prefix groups for ${username}:`, prefixGroups);

      // Find complete sessions (S1, S2, S3) within each prefix group by time proximity
      Object.entries(prefixGroups).forEach(([prefix, prefixActivities]) => {
        console.log(`Processing ${prefix} activities:`, prefixActivities);

        // Group activities by time proximity (within 20 seconds of each other)
        const timeGroups: Activity[][] = [];
        const TIME_THRESHOLD = 20 * 1000; // 20 seconds in milliseconds

        prefixActivities.forEach((activity) => {
          const activityTime = new Date(
            `${activity.activityDate} ${activity.activityTime}`
          ).getTime();

          // Find existing time group this activity belongs to
          let foundGroup = false;
          for (const group of timeGroups) {
            const groupTime = new Date(
              `${group[0].activityDate} ${group[0].activityTime}`
            ).getTime();

            // If within time threshold, add to this group
            if (Math.abs(activityTime - groupTime) <= TIME_THRESHOLD) {
              group.push(activity);
              foundGroup = true;
              break;
            }
          }

          // If no existing group found, create new one
          if (!foundGroup) {
            timeGroups.push([activity]);
          }
        });

        console.log(`Found ${timeGroups.length} time groups for ${prefix}`);

        // Process each time group to find complete sessions
        timeGroups.forEach((timeGroup, groupIndex) => {
          console.log(`Processing time group ${groupIndex}:`, timeGroup);

          // Check if we have all three stations (1, 2, 3)
          const stationNumbers = timeGroup.map((activity) =>
            parseInt(activity.baseActivityType || "0")
          );
          const uniqueStations = [...new Set(stationNumbers)].sort();

          console.log(
            `Stations in group: ${stationNumbers}, Unique: ${uniqueStations}`
          );

          // Complete session: has stations 1, 2, and 3
          if (
            uniqueStations.length === 3 &&
            uniqueStations.includes(1) &&
            uniqueStations.includes(2) &&
            uniqueStations.includes(3)
          ) {
            // Keep activities in chronological order (DON'T sort by station)
            const sortedByTime = timeGroup.sort((a, b) => {
              const timeA = new Date(
                `${a.activityDate} ${a.activityTime}`
              ).getTime();
              const timeB = new Date(
                `${b.activityDate} ${b.activityTime}`
              ).getTime();
              return timeA - timeB;
            });

            console.log(`Complete session found for ${username} (${prefix})!`);
            completeSessions.push({
              username: `${username} (${prefix} Session)`,
              activities: sortedByTime, // Keep chronological order
            });
          }
          // Partial session: has 2 or more stations but not complete
          else if (uniqueStations.length >= 2) {
            // Keep activities in chronological order (DON'T sort by station)
            const sortedByTime = timeGroup.sort((a, b) => {
              const timeA = new Date(
                `${a.activityDate} ${a.activityTime}`
              ).getTime();
              const timeB = new Date(
                `${b.activityDate} ${b.activityTime}`
              ).getTime();
              return timeA - timeB;
            });

            console.log(
              `Partial session found for ${username} (${prefix}): stations ${uniqueStations.join(
                ","
              )}`
            );

            completeSessions.push({
              username: `${username} (${prefix} Partial Session)`,
              activities: sortedByTime, // Keep chronological order
            });
          }
          // Single station activity
          else if (uniqueStations.length === 1) {
            console.log(
              `Single station activity found for ${username} (${prefix}): station ${uniqueStations[0]}`
            );

            completeSessions.push({
              username: `${username} (${prefix} Single Station)`,
              activities: timeGroup, // Already in time order
            });
          }
        });
      });
    });

    console.log("Complete sessions:", completeSessions);
    return completeSessions;
  }

  async function saveCompleteSessions() {
    if (groupedData.length === 0) {
      setError("No sessions to save");
      return;
    }

    // Filter for only complete sessions (all 3 sections)
    const completeSessions = groupedData.filter(
      (session) => session.activities.length === 3
    );

    if (completeSessions.length === 0) {
      setError("No complete sessions found");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/sessions/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessions: completeSessions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save sessions");
      }

      const result = await response.json();

      if (result.success) {
        alert(`Successfully saved ${result.savedCount} sessions!`);
      } else {
        setError(result.error || "Unknown error occurred");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving sessions"
      );
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Modern Upload UI */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#000",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h5 className="card-title mb-1" style={{ color: "#000" }}>
                    Upload BlazePod CSV Data
                  </h5>
                  <p className="text-muted mb-0 small">
                    Select a CSV file with activity data
                  </p>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-exclamation-triangle-fill me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div
                className="border border-dashed rounded-3 p-4 text-center bg-light mb-3"
                style={{ borderColor: "#ccc" }}
              >
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="d-none"
                />
                <label
                  htmlFor="csvFileInput"
                  className="d-flex flex-column align-items-center justify-content-center cursor-pointer mb-0"
                  style={{ cursor: "pointer", minHeight: "100px" }}
                >
                  <div className="mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#6c757d"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  {loading ? (
                    <div className="text-center">
                      <div
                        className="spinner-border text-secondary mb-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mb-0">Processing file...</p>
                    </div>
                  ) : (
                    <>
                      <h6 className="fw-semibold mb-1">Click to upload CSV</h6>
                      <p className="text-muted small mb-0">
                        or drag and drop file here
                      </p>
                    </>
                  )}
                </label>
              </div>

              <div className="d-flex align-items-center justify-content-between small text-muted">
                <span>Server-side CSV processing</span>
                <span>{csvData.length} records processed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Sessions Overview ONLY */}
      {groupedData.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-dark text-light">
              <div className="card-header bg-dark d-flex justify-content-between align-items-center">
                <h3 className="card-title mb-0 d-flex align-items-center">
                  <span className="me-2">Sessions Overview</span>
                  <span className="badge bg-success">
                    {
                      groupedData.filter((g) => g.activities.length === 3)
                        .length
                    }{" "}
                    Complete
                  </span>
                  <span className="badge bg-warning ms-1">
                    {groupedData.filter((g) => g.activities.length < 3).length}{" "}
                    Partial
                  </span>
                </h3>
                {groupedData.filter((g) => g.activities.length === 3).length >
                  0 && (
                  <button
                    className="btn btn-success"
                    onClick={saveCompleteSessions}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload me-2"></i>
                        Save Complete Sessions (
                        {
                          groupedData.filter((g) => g.activities.length === 3)
                            .length
                        }
                        )
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Session</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Activities</th>
                        <th>Session Start</th>
                        <th>Duration</th>
                        <th>Hits/Misses</th>
                        <th>Avg Reaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData.map((group, gIndex) => {
                        const totalDuration = group.activities.reduce(
                          (sum, activity) =>
                            sum + parseFloat(activity.activityDuration || "0"),
                          0
                        );
                        const totalHits = group.activities.reduce(
                          (sum, activity) =>
                            sum + parseInt(activity.totalHits || "0"),
                          0
                        );
                        const totalMissHits = group.activities.reduce(
                          (sum, activity) =>
                            sum + parseInt(activity.totalMissHits || "0"),
                          0
                        );
                        const avgReactionTime =
                          group.activities.reduce(
                            (sum, activity) =>
                              sum + parseFloat(activity.avgReactionTime || "0"),
                            0
                          ) / group.activities.length;

                        const activityType =
                          group.activities[0]?.activityPrefix || "Unknown";

                        // Get session start time
                        const times = group.activities.map(
                          (activity) =>
                            new Date(
                              `${activity.activityDate} ${activity.activityTime}`
                            )
                        );
                        const startTime = new Date(
                          Math.min(...times.map((t) => t.getTime()))
                        );

                        return (
                          <tr
                            key={gIndex}
                            className={
                              group.activities.length === 3
                                ? "table-success"
                                : ""
                            }
                          >
                            <td className="fw-bold">{group.username}</td>
                            <td>
                              <span
                                className={`badge ${
                                  activityType === "TD"
                                    ? "bg-primary"
                                    : "bg-info"
                                }`}
                              >
                                {activityType}
                              </span>
                            </td>
                            <td>
                              {group.activities.length === 3 ? (
                                <span className="badge bg-success">
                                  Complete
                                </span>
                              ) : (
                                <span className="badge bg-warning">
                                  Partial ({group.activities.length}/3)
                                </span>
                              )}
                            </td>
                            <td>
                              {group.activities.map((a, i) => (
                                <span
                                  key={i}
                                  className="badge bg-secondary me-1"
                                  title={`${a.activityName} at ${a.activityTime}`}
                                >
                                  S{a.baseActivityType}
                                </span>
                              ))}
                            </td>
                            <td>
                              <small>
                                {startTime.toLocaleDateString()}
                                <br />
                                <strong>
                                  {startTime.toLocaleTimeString()}
                                </strong>
                              </small>
                            </td>
                            <td>{totalDuration.toFixed(1)}s</td>
                            <td>
                              {totalHits}/{totalMissHits}
                            </td>
                            <td>{avgReactionTime.toFixed(0)}ms</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadForm;
