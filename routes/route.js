const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'capstonesql',
  password: 'password',
  database: 'capstone'
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database');
});

// Route to retrieve nutrition values by IDs
router.get('/', (req, res) => {
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

// Route to store profile data
router.post('/', (req, res) => {
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

// Route to update profile data
router.put('/:id', (req, res) => {
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

// Route to get profile data
router.get('/:id', (req, res) => {
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

module.exports = router;