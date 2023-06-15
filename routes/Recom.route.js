const express = require('express');
const router = express.Router();
const createConnection = require('../helper/init_mysql')

const connection = createConnection();
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err.message);
      return;
    }
    console.log('Connected to MySQL');
  });


// Function to retrieve morning meals from the database
function getMorningMeals(callback) {
  const query = 'SELECT * FROM morning_meals';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving morning meals:', error);
      return;
    }

    callback(results);
  });
}

// Function to retrieve afternoon meals from the database
function getAfternoonMeals(callback) {
  const query = 'SELECT * FROM afternoon_meals';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving afternoon meals:', error);
      return;
    }

    callback(results);
  });
}

// Function to retrieve night meals from the database
function getNightMeals(callback) {
  const query = 'SELECT * FROM night_meals';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving night meals:', error);
      return;
    }

    callback(results);
  });
}

// Function to recommend meals based on shuffled food names
function eachMealsRec(dayMeals) {
    const foodNames = dayMeals.map((meal) => meal.Nama);
    const shuffledFood = shuffle(foodNames);
    const choicesFood = shuffledFood.slice(0, 10);
  
    return dayMeals.filter((meal) => choicesFood.includes(meal.Nama));
  }
  
  // Function to shuffle an array using Fisher-Yates algorithm
  function shuffle(array) {
    const shuffledArray = [...array];
  
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
  
    return shuffledArray;
  }
  
  // Router to handle /meals endpoint
  router.get('/', (req, res) => {
    const currentTime = new Date().getHours();
    let meals = [];
  
    if (currentTime >= 4 && currentTime <= 12) {
      getMorningMeals((morningMeals) => {
        meals = eachMealsRec(morningMeals);
        sendResponse();
      });
    } else if (currentTime >= 12 && currentTime <= 18) {
      getAfternoonMeals((afternoonMeals) => {
        meals = eachMealsRec(afternoonMeals);
        sendResponse();
      });
    } else {
      getNightMeals((nightMeals) => {
        meals = eachMealsRec(nightMeals);
        sendResponse();
      });
    }
  
    function sendResponse() {
      if (meals.length === 0) {
        res.status(404).send('Not available at the current time');
      } else {
        res.json(meals);
      }
    }
});
  
module.exports = router;
