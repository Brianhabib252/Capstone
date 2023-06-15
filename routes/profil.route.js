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

  function nutritionCaloriesCalculation(age, height, weight, gender) {
    let energy;
    
    // Daily Calories Needed
    if (gender === 'male') {
      energy = Math.round(66 + (13.7 * weight) + (5 * height) - (6.8 * age), 2);
    } else {
      energy = Math.round(655 + (9.6 * weight) + (1.8 * height) - (4.7 * age), 2);
    }
    
    // Nutrient Calculation (Gram)
    const protein = Math.round(((15 / 100) * energy) / 4, 2);
    const carbo = Math.round(((60 / 100) * energy) / 4, 2);
    const fat = Math.round(((15 / 100) * energy) / 9, 2);
    const fiber = age + 10;
    
    return { energy, protein, carbo, fat, fiber };
  }
  
  function eachMealNutrition(energy, protein, carbo, fat, fiber) {
    energy /= 3;
    protein /= 3;
    carbo /= 3;
    fat /= 3;
    fiber /= 3;
    
    return { energy, protein, carbo, fat, fiber };
  }
  
  function appendNutrition(user, nutrition) {
    user.push(nutrition);
  }
  
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
      const nutrition = nutritionCaloriesCalculation(age, height, weight);
      const mealNutrition = eachMealNutrition(...Object.values(nutrition));
      res.json({ message: 'Data Profil Berhasil Disimpan', nutrition: mealNutrition });
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
        const nutrition = nutritionCaloriesCalculation(age, height, weight);
        const mealNutrition = eachMealNutrition(...Object.values(nutrition));
        res.json({ message: 'Data Profil Berhasil Diperbarui', nutrition: mealNutrition });
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
