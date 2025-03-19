const express = require('express');
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
const { Readable } = require('stream');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Enable files upload
app.use(fileUpload({
  createParentPath: true
}));

const supabaseUrl = "https://rrzipakdeywmmcmykjcc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyemlwYWtkZXl3bW1jbXlramNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzI0MTEsImV4cCI6MjA1NzcwODQxMX0.PX13Nyd1ga4MKfLDgOxy3lglOm2lyEau-JEO9hgpAkw";
const supabase = createClient(supabaseUrl, supabaseKey);

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

app.get('/player/:username/activities', async (req, res) => {
  const { username } = req.params;
  
  try {
    // First get the player_id for the given username
    const { data: playerData, error: playerError } = await supabase
      .from('player')
      .select('player_id, username')
      .eq('username', username)
      .single();

    if (playerError) {
      console.error('Error fetching player data:', playerError);
      return res.status(500).json({ error: playerError.message });
    }
    
    if (!playerData) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Now get sessions for this player
    const { data: sessionData, error: sessionError } = await supabase
      .from('session')
      .select('*')
      .eq('player_id', playerData.player_id);
      
    if (sessionError) {
      console.error('Error fetching session data:', sessionError);
      return res.status(500).json({ error: sessionError.message });
    }
    
    // Get session_activity entries for these sessions
    const sessionIds = sessionData.map(session => session.session_id);
    
    const { data: sessionActivityData, error: sessionActivityError } = await supabase
      .from('session_activity')
      .select('*')
      .in('session_id', sessionIds);
      
    if (sessionActivityError) {
      console.error('Error fetching session activity data:', sessionActivityError);
      return res.status(500).json({ error: sessionActivityError.message });
    }
    
    // Get activity data for these session_activities
    const activityIds = sessionActivityData.map(sa => sa.activity_id);
    
    const { data: activityData, error: activityError } = await supabase
      .from('activity')
      .select('*')
      .in('activity_id', activityIds);
      
    if (activityError) {
      console.error('Error fetching activity data:', activityError);
      return res.status(500).json({ error: activityError.message });
    }
    
    // Return the data in separated tables format
    const results = {
      player: playerData,
      sessions: sessionData,
      session_activities: sessionActivityData,
      activities: activityData
    };
    
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Endpoint to get scores from multiple tables
app.get('/scores', async (req, res) => {
  try {
    const tables = ['activity', 'player', 'session','session_activity']; 
    const results = {};

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        return res.status(500).send(error.message);
      }

      results[table] = data;
    }

    res.json(results);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});