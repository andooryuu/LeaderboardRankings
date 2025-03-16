const express = require('express');
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Enable files upload
app.use(fileUpload({
  createParentPath: true
}));

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// In-memory storage for scores
let scores = [];

// Handle file upload and parse CSV to JSON
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.csv) {
      return res.status(400).send('No file uploaded.');
    }
    const csvFile = req.files.csv;
    const filePath = path.join(uploadsDir, `${Date.now()}-${csvFile.name}`);
//
    // Save the file to the uploads directory
    await csvFile.mv(filePath);

    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Add parsed data to scores
        scores = scores.concat(results);
        res.json(results);
      });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// Endpoint to get scores
app.get('/scores', (req, res) => {
  res.json(scores);
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});