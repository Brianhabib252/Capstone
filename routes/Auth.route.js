const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { signAccessToken , signRefreshToken } = require('../helper/jwt_helper');
const validation = require('../helper/user.validation');
//const user = require('../model/user.model');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'capstonesql',
  database: 'capstone',
  password: 'password'
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

router.post('/register', validation.CreateUser, async (req, res, next) => {
    const { email, password } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkQuery, [email], (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else if (rows.length > 0) {
      res.status(400).send({ message: 'Email already registered' });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          res.status(500).send({ message: 'Error hashing password' });
        } else {
          const insertQuery = 'INSERT INTO users (email, hash) VALUES (?, ?)';
          connection.query(insertQuery, [email, hash], (err, rows, fields) => {
            if (err) {
              res.status(500).send({ message: err.sqlMessage });
            } else {
              const userId = result.insertId;
              res.send({ message: 'Registration successful' });
            }
          });
        }
      });
    }
  });
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';

  connection.query(query, [email], async (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else if (rows.length === 0) {
      res.status(404).send({ message: 'User not found' });
    } else {
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.hash);

      if (isPasswordValid) {
        const accessToken = await signAccessToken(user.id); 
        const refreshToken = await signRefreshToken(user.id)

    res.send({ accessToken, refreshToken })
      } else {
        res.status(401).send({ message: 'Invalid password' });
      }
    }
  });
});

router.post('/refresh-token', (req, res, next) => {
  res.send('getting a single product');
});

router.delete('/logout', (req, res, next) => {
  res.send('deleting a single product');
});

module.exports = router;
