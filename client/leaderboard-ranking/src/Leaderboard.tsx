import React, { useState, useEffect } from "react";
import {
  Container,
  Navbar,
  Card,
  Table,
  Badge,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Trophy, Medal, Award, BarChart3, Crown, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "./LanguageContext";
import "./Backgrounds.css";

interface Activity {
  activity_date: string;
  activity_time: string;
  activity_avg_react_time: number;
  activity_duration: number;
  activity_hits: number;
  activity_miss_hits: number;
  activity_strikes: number;
  session_id: string | number;
}

interface ActivityScore {
  activity_name: string;
  activities: Activity[];
}

interface UserScore {
  username: string;
  scores: ActivityScore[];
}

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
  score: number;
}

function Leaderboard() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<{ activity_name: string }[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [allActivities, setAllActivities] = useState<FlattenedActivity[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<
    FlattenedActivity[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Score calculation function (same as your original)
  const calculateScore = (
    duration: number,
    strikes: number,
    missHits: number
  ): number => {
    return duration + 10 * strikes + 15 * missHits;
  };

  // Helper functions for date/time formatting (same as your original)
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={20} className="text-warning" />;
      case 2:
        return <Medal size={20} className="text-secondary" />;
      case 3:
        return <Award size={20} className="text-warning" />;
      default:
        return <Star size={16} className="text-muted" />;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "warning";
      case 2:
        return "secondary";
      case 3:
        return "dark";
      default:
        return "outline-light";
    }
  };

  // Function to get best score per player per activity type (your original logic)
  const getBestScoresPerPlayer = (
    activities: FlattenedActivity[],
    activityFilter?: string
  ) => {
    // Filter by activity if specified
    let filtered =
      activityFilter && activityFilter !== "ALL"
        ? activities.filter((item) => item.activity_name === activityFilter)
        : activities;

    // Group by username and activity_name, keep only the best score
    const bestScores = new Map<string, FlattenedActivity>();

    filtered.forEach((activity) => {
      const key = `${activity.username}-${activity.activity_name}`;
      const existing = bestScores.get(key);

      // For this scoring system, LOWER score is better (less time + fewer penalties)
      if (
        !existing ||
        activity.score < existing.score ||
        (activity.score === existing.score &&
          activity.total_hits > existing.total_hits) ||
        (activity.score === existing.score &&
          activity.total_hits === existing.total_hits &&
          activity.avg_react_time < existing.avg_react_time)
      ) {
        bestScores.set(key, activity);
      }
    });

    // Convert back to array and sort by calculated score (LOWER is better)
    const result = Array.from(bestScores.values());
    result.sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score; // Lower score is better
      }
      if (b.total_hits !== a.total_hits) {
        return b.total_hits - a.total_hits; // More hits is better as tiebreaker
      }
      return a.avg_react_time - b.avg_react_time; // Lower reaction time is better
    });

    return result;
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/scores");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract unique activities for the filter dropdown (TD and EX only)
        const activityNames = new Set<string>();
        const uniqueActivities: { activity_name: string }[] = [];

        data.forEach((user: UserScore) => {
          user.scores.forEach((score) => {
            if (!activityNames.has(score.activity_name)) {
              activityNames.add(score.activity_name);
              uniqueActivities.push({ activity_name: score.activity_name });
            }
          });
        });

        setActivities(uniqueActivities);

        if (uniqueActivities.length > 0) {
          setSelectedActivity("");
        }

        // Flatten all activities with calculated scores
        const flattened: FlattenedActivity[] = [];

        data.forEach((user: UserScore) => {
          user.scores.forEach((score) => {
            score.activities.forEach((activity) => {
              const sessionScore = calculateScore(
                activity.activity_duration,
                activity.activity_strikes,
                activity.activity_miss_hits
              );

              flattened.push({
                id: `${user.username}-${score.activity_name}-${activity.session_id}`,
                username: user.username,
                activity_name: score.activity_name,
                activity_date: activity.activity_date,
                activity_time: activity.activity_time,
                duration: activity.activity_duration,
                avg_react_time: activity.activity_avg_react_time,
                total_hits: activity.activity_hits,
                total_miss_hits: activity.activity_miss_hits,
                total_strikes: activity.activity_strikes,
                score: sessionScore,
              });
            });
          });
        });

        setAllActivities(flattened);
        setDisplayedActivities(getBestScoresPerPlayer(flattened));
      } catch (error) {
        console.error("Error fetching scores:", error);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  useEffect(() => {
    if (allActivities.length === 0) return;

    const filteredAndBest = getBestScoresPerPlayer(
      allActivities,
      selectedActivity
    );
    setDisplayedActivities(filteredAndBest);
  }, [selectedActivity, allActivities]);

  const handleActivityChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedActivity(event.target.value);
  };

  if (loading) {
    return (
      <div className="leaderboard-background">
        <div className="background-content">
          <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="text-center">
              <Spinner animation="border" variant="light" className="mb-3" />
              <p className="text-light">{t.loadingLeaderboard}</p>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-background">
        <div className="background-content">
          <Container className="py-5">
            <Alert variant="danger" className="text-center">
              <h4>Error Loading Leaderboard</h4>
              <p>{error}</p>
              <Button
                variant="outline-danger"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Alert>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-background">
      <div className="background-content">
        {/* Navigation */}
        <Navbar bg="transparent" variant="dark" expand="lg"></Navbar>

        {/* Main Content */}
        <Container className="py-4">
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-white mb-3">
              <Trophy className="me-3" size={48} />
              {t.leaderboardRanking}
            </h1>
          </div>

          {/* Activity Filter */}
          <div className="text-center mb-4">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-4">
                <select
                  className="form-select bg-dark text-light border-secondary"
                  value={selectedActivity}
                  onChange={handleActivityChange}
                  aria-label="Select activity"
                >
                  {activities.map((a) => (
                    <option key={a.activity_name} value={a.activity_name}>
                      {a.activity_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Table View */}
          <Card className="transparent-card border-0 shadow-lg d-none d-md-block">
            <Card.Header className="bg-transparent border-bottom border-secondary">
              <h3 className="mb-0 text-white d-flex align-items-center">
                <BarChart3 className="me-2" size={24} />
                {t.topPerformers}
              </h3>
            </Card.Header>
            <Card.Body className="p-0">
              {displayedActivities.length > 0 ? (
                <Table
                  variant="dark"
                  hover
                  responsive
                  className="mb-0 transparent-table"
                >
                  <thead>
                    <tr>
                      <th scope="col">{t.rank}</th>
                      <th scope="col">{t.playerName}</th>
                      <th scope="col">{t.activityName}</th>
                      <th scope="col">{t.activityDate}</th>
                      <th scope="col">{t.activityTime}</th>
                      <th scope="col">{t.duration} (s)</th>
                      <th scope="col">{t.avgReactionTime} (ms)</th>
                      <th scope="col">{t.totalHits}</th>
                      <th scope="col">{t.missHits}</th>
                      <th scope="col">{t.strikes}</th>
                      <th scope="col">{t.score}</th>
                      <th scope="col">{}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedActivities.map((activity, index) => {
                      const rank = index + 1;

                      return (
                        <tr
                          key={activity.id}
                          className={index < 3 ? "bg-dark" : ""}
                        >
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              {getRankIcon(rank)}
                              <Badge
                                bg={getRankBadgeVariant(rank)}
                                className="ms-2"
                              >
                                {rank}
                              </Badge>
                            </div>
                          </td>
                          <td className="fw-bold text-info">
                            {activity.username}
                          </td>
                          <td>
                            <Badge bg="info">{activity.activity_name}</Badge>
                          </td>
                          <td>{formatDate(activity.activity_date)}</td>
                          <td>{activity.activity_time}</td>
                          <td>
                            <Badge bg="info">{activity.duration}</Badge>
                          </td>
                          <td>
                            <Badge bg="warning" text="dark">
                              {activity.avg_react_time}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="success">{activity.total_hits}</Badge>
                          </td>
                          <td>
                            <Badge bg="danger">
                              {activity.total_miss_hits}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {activity.total_strikes}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="primary" className="fs-6">
                              {activity.score}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Link to={`/stats/${activity.username}`}>
                              <Button variant="outline-info" size="sm">
                                {t.viewDetails || "View Details"}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <p className="text-light">
                    {`No data available for ${selectedActivity}`}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Mobile view */}
          <div className="d-md-none">
            {displayedActivities.map((activity, index) => {
              const rank = index + 1;
              let medalIcon = null;

              if (index === 0) {
                medalIcon = <Award size={24} className="text-warning" />;
              } else if (index === 1) {
                medalIcon = <Award size={24} className="text-light" />;
              } else if (index === 2) {
                medalIcon = <Award size={24} className="text-secondary" />;
              }

              return (
                <Card
                  key={activity.id}
                  className="transparent-card border-0 shadow mb-3"
                >
                  <Card.Header className="bg-transparent border-bottom border-secondary d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {medalIcon && <span className="me-2">{medalIcon}</span>}
                      <span className="fw-bold text-info">
                        {activity.username}
                      </span>
                    </div>
                    <Badge bg={getRankBadgeVariant(rank)}>
                      {t.rank} #{rank}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.activityName}:
                        </small>
                        <Badge bg="info">{activity.activity_name}</Badge>
                      </div>
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.score}:
                        </small>
                        <Badge bg="primary" className="fw-bold">
                          {activity.score}
                        </Badge>
                      </div>
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.activityDate}:
                        </small>
                        <span className="text-light">
                          {formatDate(activity.activity_date)}
                        </span>
                      </div>
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.activityTime}:
                        </small>
                        <span className="text-light">
                          {activity.activity_time}
                        </span>
                      </div>
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.duration}:
                        </small>
                        <Badge bg="info">{activity.duration}s</Badge>
                      </div>
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.avgReactionTime}:
                        </small>
                        <Badge bg="warning" text="dark">
                          {activity.avg_react_time}ms
                        </Badge>
                      </div>
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.hitsMisses || "Hits/Misses"}:
                        </small>
                        <span>
                          <Badge bg="success" className="me-1">
                            {activity.total_hits}
                          </Badge>
                          <Badge bg="danger">{activity.total_miss_hits}</Badge>
                        </span>
                      </div>
                      <div className="col-6">
                        <small className="d-block text-secondary">
                          {t.strikes}:
                        </small>
                        <Badge bg="secondary">{activity.total_strikes}</Badge>
                      </div>
                      <div className="col-12 mt-3">
                        <Link to={`/stats/${activity.username}`}>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="w-100"
                          >
                            {t.viewDetails || "View Details"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Container>

        {/* Footer */}
        <footer className="bg-transparent text-center py-4 mt-auto ">
          <p className="text-light mb-0">© 2025 {t.airstoftTracker}</p>
        </footer>
      </div>
    </div>
  );
}

export default Leaderboard;
