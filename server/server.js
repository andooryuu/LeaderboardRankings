const express = require('express');
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
const { Readable } = require('stream');
const cors = require('cors');
const { Pool } = require('pg');

// Configure the PostgreSQL client
const pool = new Pool({
  user: 'postgres.rrzipakdeywmmcmykjcc', // Replace with your Supabase database user
  host: 'aws-0-ca-central-1.pooler.supabase.com', // Replace with your Supabase database host
  database: 'postgres', // Replace with your Supabase database name
  password: 'LaZoneTracker101', // Replace with your Supabase database password
  port: 6543, // Default PostgreSQL port
});

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Enable files upload
app.use(fileUpload({
  createParentPath: true
}));

//const supabaseUrl = "https://rrzipakdeywmmcmykjcc.supabase.co";
//const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyemlwYWtkZXl3bW1jbXlramNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzI0MTEsImV4cCI6MjA1NzcwODQxMX0.PX13Nyd1ga4MKfLDgOxy3lglOm2lyEau-JEO9hgpAkw";
//const supabase = createClient(supabaseUrl, supabaseKey);

const transformData = (data) => {
  return {
    activityDate: data['Activity date'],
    activityTime: data['Activity time'],
    activityName: data['Activity name'],
    durationType: data['Duration type'],
    durationHitCount: data['Duration hit count'],
    cycleDuration: data['Cycle duration (sec)'],
    activityDuration: data['Activity duration (sec)'],
    lightLogic: data['Light logic'],
    stationNumber: data['Station number'],
    cycleNumber: data['Cycle number'],
    playerNumber: data['Player number'],
    playerName: data['Player name'],
    avgReactionTime: data['Avg reaction time (ms)'],
    totalHits: data['Total hits'],
    totalMissHits: data['Total miss hits'],
    totalStrikes: data['Total strikes'],
    repetitions: data['Repetitions'],
    lightsOut: data['Lights out'],
    visualCue1: data['Visual cue #1 (ms)'],
    color1: data['Color #1'],
    visualCue2: data['Visual cue #2 (ms)'],
    color2: data['Color #2'],
    visualCue3: data['Visual cue #3 (ms)'],
    color3: data['Color #3'],
    visualCue4: data['Visual cue #4 (ms)'],
    color4: data['Color #4'],
    visualCue5: data['Visual cue #5 (ms)'],
    color5: data['Color #5'],
    visualCue6: data['Visual cue #6 (ms)'],
    color6: data['Color #6'],
    visualCue7: data['Visual cue #7 (ms)'],
    color7: data['Color #7'],
    visualCue8: data['Visual cue #8 (ms)'],
    color8: data['Color #8'],
    visualCue9: data['Visual cue #9 (ms)'],
    color9: data['Color #9'],
    visualCue10: data['Visual cue #10 (ms)'],
    color10: data['Color #10'],
    visualCue11: data['Visual cue #11 (ms)'],
    color11: data['Color #11'],
    visualCue12: data['Visual cue #12 (ms)'],
    color12: data['Color #12'],
    visualCue13: data['Visual cue #13 (ms)'],
    color13: data['Color #13'],
    levels: data['Levels'],
    steps: data['Steps']
  };
};

// In-memory storage for scores
let scores = [];

// Handle file upload and parse CSV to JSON
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.csv) {
      return res.status(400).send('No file uploaded.');
    }
    const csvFile = req.files.csv;

    const results = [];
    const stream = Readable.from(csvFile.data.toString());
    stream
      .pipe(csv())
      .on('data', (data) => results.push(transformData(data)))
      .on('end', () => {
        scores = results;
        res.json(results);
      });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});
app.get('/session/visualCues/:sessionId', async (req, res) => {
  const { sessionId } = req.params; // Extract sessionId from the request parameters
  try {
    const query = `
      SELECT 
        v.cue_order,
        v.visual_cue_time,
        a.activity_name
      FROM 
        Visual_Cues v
      JOIN 
        Session_Activity sa ON sa.session_activity_id = v.session_activity_id
      JOIN
        Activity a ON a.activity_id = sa.activity_id
      JOIN 
        Session s ON s.session_id = sa.session_id
      JOIN 
        Players pl ON pl.player_id = s.player_id
      WHERE 
        s.session_id = $1 -- Use a placeholder for sessionId
      ORDER BY 
        a.activity_name, v.cue_order;
    `;

    const { rows } = await pool.query(query, [sessionId]); // Pass sessionId as a parameter
    res.json(rows); 
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const query=`SELECT 
    s.session_id,
    p.activity_date,  -- Ensure this column exists in the Performance table
    p.activity_time,   -- Ensure this column exists in the Performance table
    a.activity_name,
    p.activity_duration,
    p.activity_hits,
    p.activity_miss_hits,
    p.activity_avg_react_time,
    p.activity_strikes
FROM
    Performance p
JOIN
    Session_Activity sa ON p.session_activity_id = sa.session_activity_id
JOIN
    Activity a ON a.activity_id = sa.activity_id
JOIN
    Session s ON s.session_id = sa.session_id
JOIN
    Players pl ON pl.player_id = s.player_id
WHERE 
    pl.username = '${username}';  -- Use single quotes for string literals`
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Endpoint to get scores from multiple tables
app.get('/scores', async (req, res) => {
  try {
    const query = `
      SELECT 
        pl.username,
        REGEXP_REPLACE(a.activity_name, '\\d+$', '') AS base_activity_name, -- Remove trailing numbers
        SUM(perf.activity_duration) AS activity_duration,
        SUM(perf.activity_hits) AS activity_hits,
        SUM(perf.activity_miss_hits) AS activity_miss_hits,
        AVG(perf.activity_avg_react_time) AS activity_avg_react_time, -- Average reaction time
        SUM(perf.activity_strikes) AS activity_strikes,
        MIN(perf.activity_date) AS first_activity_date, -- Get the first activity date
        MIN(perf.activity_time) AS first_activity_time -- Get the first activity time
      FROM 
        Performance perf
      JOIN 
        Session_Activity sa ON perf.session_activity_id = sa.session_activity_id
      JOIN    
        Activity a ON a.activity_id = sa.activity_id
      JOIN 
        Session s ON sa.session_id = s.session_id
      JOIN 
        Players pl ON pl.player_id = s.player_id
      GROUP BY 
        pl.username, base_activity_name
      ORDER BY 
        pl.username, base_activity_name;
    `;

    const { rows } = await pool.query(query);

    // Transform the data into the desired format
    const scores = rows.map((row) => ({
      username: row.username,
      scores: [
        {
          activity_name: row.base_activity_name,
          activities: [
            {
              activity_duration: row.activity_duration,
              activity_hits: row.activity_hits,
              activity_miss_hits: row.activity_miss_hits,
              activity_avg_react_time: row.activity_avg_react_time,
              activity_strikes: row.activity_strikes,
              activity_date: row.first_activity_date, // Use the first activity date
              activity_time: row.first_activity_time, // Use the first activity time
            },
          ],
        },
      ],
    }));

    res.json(scores); // Return the transformed data
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send(err.toString());
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});