const express = require('express');
const router = express.Router();
const createConnection = require('../helper/init_mysql')
const { 
    signAccessToken, 
    signRefreshToken, 
    verifyRefreshToken, 
    verifyAccessToken
  } = require('../helper/jwt_helper');

  const connection = createConnection();
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err.message);
      return;
    }
    console.log('Connected to MySQL');
  });


  // API endpoint to store profile data
  router.post('/', verifyAccessToken, (req, res) => {
    const { height, weight, age, gender } = req.body;
    const { userId, name } = req.payload; // Mengakses id dan name dari payload JWT
  
    const profile = {
      userId,
      name,
      height,
      weight,
      age,
      gender
    };
  

    // API endpoint to update profile data
    const query = 'INSERT INTO profil SET ?';
  
    connection.query(query, profile, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menyimpan data profil' });
      } else {
        res.json({ message: 'Data profil berhasil disimpan' });
      }
    });
  });
  
  
  
  
  // Route to update profile data
  router.put('/', verifyAccessToken, (req, res) => {
    const { height, weight, age, gender } = req.body;
    const { userId, name } = req.payload;
  
    const updatedProfile = {
      userId,
      name,
      height,
      weight,
      age,
      gender
    };
  
    const query = 'UPDATE profil SET ? WHERE userId = ?';
  
    connection.query(query, [updatedProfile, userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal Memperbarui Data profil' });
      } else {
        res.json({ message: 'Data profil berhasil diperbarui' });
      }
    });
  });


  // API endpoint to get profile data
  router.get('/', verifyAccessToken, (req, res) => {
    const { userId } = req.payload;
  
    const query = 'SELECT * FROM profil WHERE userId = ?';
    const values = [userId];
  
    connection.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mendapatkan profil pengguna' });
      } else if (result.length === 0) {
        res.status(404).json({ error: 'profil tidak ditemukan' });
      } else {
        const profile = result[0];
        res.json(profile);
      }
    });
  });

  module.exports = router;