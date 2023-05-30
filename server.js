const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const app = express();
const port = 3000;

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'capstonesql',
  password: 'password',
  database: 'capstone'
});

// Middleware to parse JSON input
app.use(express.json());

// Connect to the MySQL database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database');
});

// API endpoint to retrieve nutrition values by IDs
app.get('/nutrition', (req, res) => {
  const ids = req.query.ids; // Assuming the input IDs are provided as a comma-separated list in the query parameter "ids"
  const idArray = ids.split(','); // Split the IDs into an array
  
  const query = `SELECT id, calorie, protein, karbo, fat, fiber FROM Nutrition WHERE id IN (${idArray.map(() => '?').join(',')})`;
  
  connection.query(query, idArray, (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      res.status(404).json({ error: 'No nutrition information found for the provided IDs' });
    } else {
      const nutritionData = result.map(row => ({
        id: row.id,
        calorie: row.calorie,
        protein: row.protein,
        karbo: row.karbo,
        fat: row.fat,
        fiber: row.fiber
      }));
      res.json(nutritionData);
    }
  });
});

// API endpoint to store profile data
app.post('/profil', (req, res) => {
  const { name, height, weight, age, alergi } = req.body;
  
  const profile = {
    name,
    height,
    weight,
    age,
    alergi
  };

  const query = 'INSERT INTO profil SET ?';

  connection.query(query, profile, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to store profile data' });
    } else {
      const generatedId = result.insertId;
      res.json({ message: 'Profile data stored successfully', id: generatedId });
    }
  });
});

// API endpoint to update profile data
app.put('/profil/:id', (req, res) => {
  const { id } = req.params;
  const { weight, height, age, alergi } = req.body;

  const query = 'UPDATE profil SET weight = ?, height = ?, age = ?, alergi = ? WHERE id = ?';
  const values = [weight, height, age, alergi, id];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update profile data' });
    } else {
      res.json({ message: 'Profile data updated successfully' });
    }
  });
});

// API endpoint to get profile data
app.get('/profil/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM profil WHERE id = ?';
  const values = [id];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve profile data' });
    } else if (result.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
    } else {
      const profile = result[0];
      res.json(profile);
    }
  });
});

const upload = multer();

const pathKey = path.resolve('./keyfile.json');

// Create a new instance of the GCS client
const gcs = new Storage({
  projectId: 'nufochild',
  keyFilename: pathKey
});

// Specify the name of your GCS bucket
const bucketName = 'nufochild-photo';
const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

const ImgUpload = {};

ImgUpload.uploadToGcs = (req, res, next) => {
  if (!req.file) return next();

  const gcsname = moment().format('YYYYMMDD-HHmmss'); + path.extname(req.file.originalname);
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(req.file.buffer);
};


// API endpoint to upload an image to GCS
app.post('/upload', upload.single('image'), ImgUpload.uploadToGcs, (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
  } else {
    res.json({ imageUrl: req.file.cloudStoragePublicUrl });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});