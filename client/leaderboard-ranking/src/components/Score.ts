interface Score {
    id: number;
    session_id: number;
    activity_date: string;
    activity_time: string;
    activity_name: string;
    duration_type: string;
    activity_duration: string;
    light_logic: string;
    station_number: number;
    player_id: number;
    username: string;
    avg_react_time: number;
    total_hits: number;
    total_miss_hits: number;
    total_strikes: number;
    levels: string;
    steps: string;
  }
export default Score;