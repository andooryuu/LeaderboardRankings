interface Session {
    session_id: number;
    station_number: number;
    player_id: number;
    avg_react_time: number;
    duration: number;
    session_time: string;
    session_date: string;
    total_hits: number;
    total_miss_hits: number;
    total_strikes: number;
    levels: number;
    steps: number;
    duration_type: string;
  }
    export default Session;