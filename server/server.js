require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const csv = require("csv-parser");
const { Readable } = require("stream");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 6543,
});

const app = express();
const port = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    // Allow self-signed certificates
    rejectUnauthorized: false,
  },
});
// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

// Increase payload limits for large session data
app.use(express.json({ limit: "50mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Also increase URL-encoded limit

// Enable files upload
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file upload limit
  })
);

//const supabaseUrl = "https://rrzipakdeywmmcmykjcc.supabase.co";
//const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyemlwYWtkZXl3bW1jbXlramNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzI0MTEsImV4cCI6MjA1NzcwODQxMX0.PX13Nyd1ga4MKfLDgOxy3lglOm2lyEau-JEO9hgpAkw";
//const supabase = createClient(supabaseUrl, supabaseKey);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

app.post("/auth/request-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email is the hardcoded admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res
        .status(403)
        .json({ error: "Email not authorized for admin access" });
    }

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Store code with 10-minute expiration
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    });

    // Send email - FIXED THE HTML TEMPLATE
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Code de vérification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Accès Admin</h2>
          <p>Le code de vérification est:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${verificationCode}
          </div>
          <p>Ce code expirera dans 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Verification code sent to your email",
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

app.post("/auth/verify-code", (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res
        .status(400)
        .json({ error: "No verification code found for this email" });
    }

    // Check if code has expired
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(429).json({
        error: "Too many failed attempts. Please request a new code.",
      });
    }

    // Verify code
    if (storedData.code !== code) {
      storedData.attempts++;
      return res.status(400).json({ error: "Invalid verification code" });
    }
    // Code is valid - generate JWT token
    const token = jwt.sign(
      {
        email: email,
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Clean up verification code
    verificationCodes.delete(email);

    res.json({
      success: true,
      token: token,
      expiresIn: "24h",
      user: {
        email: email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

app.get("/auth/verify-token", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

const transformData = (data) => {
  // Start with the basic fields
  const transformed = {
    activityDate: data["Activity date"],
    activityTime: data["Activity time"],
    activityName: data["Activity name"],
    durationType: data["Duration type"],
    durationHitCount: data["Duration hit count"],
    cycleDuration: data["Cycle duration (sec)"],
    activityDuration: data["Activity duration (sec)"],
    lightLogic: data["Light logic"],
    stationNumber: data["Station number"],
    cycleNumber: data["Cycle number"],
    playerNumber: data["Player number"],
    playerName: data["Player name"],
    avgReactionTime: data["Avg reaction time (ms)"],
    totalHits: data["Total hits"],
    totalMissHits: data["Total miss hits"],
    totalStrikes: data["Total strikes"],
    repetitions: data["Repetitions"],
    lightsOut: data["Lights out"],
    levels: data["Levels"],
    steps: data["Steps"],
  };

  // Dynamically add any visual cue and color fields
  // This will detect all visual cue fields regardless of how many there are
  Object.keys(data).forEach((key) => {
    if (key.match(/^Visual cue #(\d+) \(ms\)$/)) {
      // Extract the cue number from the key (e.g., "Visual cue #5 (ms)" -> 5)
      const cueNumber = key.match(/^Visual cue #(\d+) \(ms\)$/)[1];
      const cueKey = `visualCue${cueNumber}`;
      const colorKey = `color${cueNumber}`;

      // Add the visual cue data to the transformed object
      transformed[cueKey] = data[key];
      transformed[colorKey] = data[`Color #${cueNumber}`];
    }
  });

  return transformed;
};

// In-memory storage for scores
let scores = [];

// Add this to your server.js file
app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.csv) {
      return res.status(400).send("No file uploaded.");
    }

    const csvFile = req.files.csv;
    const results = [];
    const stream = Readable.from(csvFile.data.toString());

    stream
      .pipe(csv())
      .on("data", (data) => {
        const transformed = transformData(data);
        results.push(transformed);
      })
      .on("end", () => {
        console.log(`Processed ${results.length} activities from CSV`);
        res.json(results);
      })
      .on("error", (error) => {
        console.error("CSV parsing error:", error);
        res.status(500).send("Error parsing CSV file");
      });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send(err.toString());
  }
});
app.get("/session/visualCues/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Modified query to combine visual cues from all three sections in the session
    // In your /session/visualCues/:sessionId endpoint
    const query = `
      SELECT 
        v.cue_order,
        v.visual_cue_time,
        v.visual_cue_color,
        a.activity_name,
        sa.session_activity_id, -- Add this to distinguish activity instances
        REGEXP_REPLACE(a.activity_name, '[^0-9]', '', 'g') AS section_number,
        p.activity_date,
        p.activity_time
      FROM 
        Visual_Cues v
      JOIN 
        Session_Activity sa ON sa.session_activity_id = v.session_activity_id
      JOIN
        Activity a ON a.activity_id = sa.activity_id
      JOIN 
        Session s ON s.session_id = sa.session_id
      JOIN
        Performance p ON p.session_activity_id = sa.session_activity_id
      JOIN 
        Players pl ON pl.player_id = s.player_id
      WHERE 
        s.session_id = $1
      ORDER BY 
        a.activity_name, sa.session_activity_id, v.cue_order;
    `;

    const { rows } = await pool.query(query, [sessionId]);

    // Transform the data to combine visual cues from all sections
    const combinedVisualCues = {
      sessionId: sessionId,
      playerName: rows.length > 0 ? rows[0].player_name : "Unknown",
      date: rows.length > 0 ? rows[0].activity_date : null,
      sections: {},
      combinedCues: [],
    };

    // Organize cues by section first
    rows.forEach((row) => {
      // Use both activity name and session_activity_id for unique se
      const sectionKey = `${row.activity_name}-${row.session_activity_id}`;

      if (!combinedVisualCues.sections[sectionKey]) {
        combinedVisualCues.sections[sectionKey] = [];
      }

      combinedVisualCues.sections[sectionKey].push({
        cue_order: row.cue_order,
        visual_cue_time: row.visual_cue_time,
        visual_cue_color: row.visual_cue_color,
        section_number: row.section_number,
        activity_name: row.activity_name,
        session_activity_id: row.session_activity_id,
      });
      // Also add to the combined array
      combinedVisualCues.combinedCues.push({
        cue_order: row.cue_order,
        visual_cue_time: row.visual_cue_time,
        visual_cue_color: row.visual_cue_color,
        section_number: row.section_number,
        activity_name: row.activity_name,
      });
    });

    // Sort the combined cues by time
    combinedVisualCues.combinedCues.sort(
      (a, b) => a.visual_cue_time - b.visual_cue_time
    );

    res.json(combinedVisualCues);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/stats/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const query = `SELECT 
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
    pl.username = '${username}';  -- Use single quotes for string literals`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to get scores from multiple tables - SESSION LEVEL DATA (AGGREGATED)
// ...existing code...

// Endpoint to get scores from multiple tables - SESSION LEVEL DATA (AGGREGATED)
app.get("/scores", async (req, res) => {
  try {
    const query = `
      SELECT 
        pl.username,
        s.session_id,
        MIN(perf.activity_date) as session_date,
        MIN(perf.activity_time) as session_time,
        SUM(perf.activity_duration) as total_duration,
        SUM(perf.activity_hits) as total_hits,
        SUM(perf.activity_miss_hits) as total_miss_hits,
        SUM(perf.activity_strikes) as total_strikes,
        -- Weighted average reaction time (fixed calculation)
        CASE 
          WHEN SUM(perf.activity_hits) > 0 
          THEN ROUND(
            SUM(perf.activity_avg_react_time * perf.activity_hits) / SUM(perf.activity_hits)
          )
          ELSE 0 
        END as avg_react_time,
        -- Get the activity type (TD or EX) from the first activity
        SUBSTRING(MIN(a.activity_name) FROM '^[A-Z]+') as activity_type,
        -- Count activities per session to ensure complete sessions
        COUNT(perf.session_activity_id) as activity_count
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
        pl.username, s.session_id
      HAVING 
        COUNT(perf.session_activity_id) = 3  -- Only complete sessions (3 activities)
      ORDER BY 
        pl.username, s.session_id;
    `;

    const { rows } = await pool.query(query);

    console.log("Sample row from database:", rows[0]); // Debug log

    // Transform the data into the desired format - group by username and activity type
    const userMap = new Map();

    rows.forEach((row) => {
      if (!userMap.has(row.username)) {
        userMap.set(row.username, {
          username: row.username,
          scores: [],
        });
      }

      const user = userMap.get(row.username);

      // Find existing activity type (TD or EX) or create new one
      let activityScore = user.scores.find(
        (score) => score.activity_name === row.activity_type
      );

      if (!activityScore) {
        activityScore = {
          activity_name: row.activity_type, // This will be "TD" or "EX"
          activities: [],
        };
        user.scores.push(activityScore);
      }

      // Add this session's aggregated data
      activityScore.activities.push({
        activity_date: row.session_date,
        activity_time: row.session_time,
        activity_duration: parseInt(row.total_duration), // Ensure it's an integer
        activity_hits: parseInt(row.total_hits),
        activity_miss_hits: parseInt(row.total_miss_hits),
        activity_avg_react_time: parseInt(row.avg_react_time),
        activity_strikes: parseInt(row.total_strikes),
        session_id: row.session_id,
      });
    });

    // Convert map to array
    const scores = Array.from(userMap.values());

    console.log("Sample transformed data:", JSON.stringify(scores[0], null, 2)); // Debug log

    res.json(scores);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send(err.toString());
  }
});

// ...existing code...
// Updated /sessions/save endpoint to create one session for all three activities
app.post("/sessions/save", async (req, res) => {
  try {
    const { sessions } = req.body;

    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({ error: "No valid sessions provided" });
    }

    let savedCount = 0;

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const session of sessions) {
        // Only process complete sessions (3 activities)
        if (session.activities.length !== 3) continue;

        // Extract username from session (remove the prefix part)
        const username = session.username.split(" (")[0];

        // 1. Get or create player
        const playerResult = await client.query(
          "SELECT player_id FROM Players WHERE username = $1",
          [username]
        );

        let playerId;
        if (playerResult.rows.length > 0) {
          playerId = playerResult.rows[0].player_id;
        } else {
          const newPlayerResult = await client.query(
            "INSERT INTO Players (username) VALUES ($1) RETURNING player_id",
            [username]
          );
          playerId = newPlayerResult.rows[0].player_id;
        }

        // 2. Create ONE session for all three activities
        // Use the first activity's station as the session's station number
        // (or any station identifier you prefer)
        const stationIdentifier = parseInt(
          session.activities[0].baseActivityType || "1"
        );

        const sessionResult = await client.query(
          "INSERT INTO Session (player_id, station_number) VALUES ($1, $2) RETURNING session_id",
          [playerId, stationIdentifier]
        );
        const sessionId = sessionResult.rows[0].session_id;

        // 3. Process each activity and link to the same session
        for (const activity of session.activities) {
          // Extract section number from activity name (S1, S2, S3)
          const sectionMatch = activity.activityName.match(/S(\d+)/);
          const stationNumber = sectionMatch ? parseInt(sectionMatch[1]) : 1;

          if (stationNumber < 1 || stationNumber > 3) {
            console.warn(
              `Invalid station number ${stationNumber} for activity ${activity.activityName}. Skipping this activity.`
            );
            continue;
          }

          // Get activity name with number (e.g., "TD1", "TD2", "TD3")
          const activityPrefix = activity.activityPrefix || "TD";
          const activityName = `${activityPrefix}${stationNumber}`; // This will create TD1, TD2, TD3

          console.log(
            `Processing activity: ${activityName} for session ${sessionId}`
          );
          console.log(
            `Station number: ${stationNumber}, Extracted from: ${activity.activityName}`
          );

          // Get or create activity
          const activityResult = await client.query(
            "SELECT activity_id FROM Activity WHERE activity_name = $1",
            [activityName]
          );
          let activityId;
          if (activityResult.rows.length > 0) {
            activityId = activityResult.rows[0].activity_id;
          } else {
            // Create new activity with name (TD1, TD2, etc.) and light logic
            const newActivityResult = await client.query(
              "INSERT INTO Activity (activity_name, light_logic) VALUES ($1, $2) RETURNING activity_id",
              [activityName, activity.lightLogic || null]
            );
            activityId = newActivityResult.rows[0].activity_id;
          }

          // 4. Create session_activity link
          const sessionActivityResult = await client.query(
            "INSERT INTO Session_Activity (session_id, activity_id) VALUES ($1, $2) RETURNING session_activity_id",
            [sessionId, activityId]
          );
          const sessionActivityId =
            sessionActivityResult.rows[0].session_activity_id;

          // 5. Save performance data
          await client.query(
            `INSERT INTO Performance 
             (session_activity_id, activity_duration, activity_hits, activity_miss_hits, 
              activity_avg_react_time, activity_strikes, activity_date, activity_time) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              sessionActivityId,
              parseInt(activity.activityDuration || "0"),
              parseInt(activity.totalHits || "0"),
              parseInt(activity.totalMissHits || "0"),
              parseInt(activity.avgReactionTime || "0"),
              parseInt(activity.totalStrikes || "0"),
              activity.activityDate,
              activity.activityTime,
            ]
          );

          // 6. Save visual cues data (if present)
          // In sessions/save endpoint, replace your visual cues loop with:
          const visualCueKeys = Object.keys(activity).filter(
            (key) =>
              key.startsWith("visualCue") &&
              activity[key] &&
              activity[key].trim() !== ""
          );

          for (const key of visualCueKeys) {
            const cueNumber = parseInt(key.replace("visualCue", ""));
            const cueTime = activity[key];
            const cueColor = activity[`color${cueNumber}`];

            if (cueTime && cueTime.trim() !== "") {
              await client.query(
                "INSERT INTO Visual_Cues (session_activity_id, cue_order, visual_cue_time, visual_cue_color) VALUES ($1, $2, $3, $4)",
                [sessionActivityId, cueNumber, parseInt(cueTime), cueColor]
              );
            }
          }
        }

        savedCount++;
      }

      await client.query("COMMIT");
      res.json({ success: true, savedCount });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error saving sessions:", error);
    res
      .status(500)
      .json({ error: "Failed to save sessions: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
