const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { 
  signAccessToken, 
  signRefreshToken, 
  verifyRefreshToken, 
  verifyAccessToken
} = require('../helper/jwt_helper');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'capstone'
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

router.post("/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;

  console.log({
      name,
      email,
      password,
      password2
  });

  let errors = [];

  if (!name || !email || !password || !password2){
      errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
      errors.push({ message: "Password should be at least 6 characters" });
  }

  if (password != password2) {
      errors.push({ message: "Password do not match" });
  }

  if(errors.length > 0) {
      res.status(500).send({ errors });
  }else{
      let hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);

      await connection.query(
          `SELECT * FROM users WHERE email = ?`, [email], (err, rows, fields)=>{
              if (err){
                res.status(500).send({ message: err.sqlMessage });
              }

              if(rows.length > 0) {
                res.status(400).send({ message: 'Email already registered' });
              }else{
                connection.query(
                      `INSERT INTO users (name, email, password)
                      VALUES (?,?,?)`, [name, email, hashedPassword], 
                      (err, results)=>{
                          if (err) {
                              throw err;
                          }
                          console.log(results.rows);
                          res.status(201).send({message: "You are now registered. Please login"});
                      }
                  )
              }
          }
      )
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';

  connection.query(query, [email], async (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else if (rows.length === 0) {
      res.status(404).send({ message: 'User or Password not Correct' });
    } else {
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const accessToken = await signAccessToken(user.id); 
        const refreshToken = await signRefreshToken(user.id)

    res.send({ accessToken, refreshToken })
      } else {
        res.status(401).send({ message: 'User or Password not Correct' });
      }
    }
  });
});

router.post('/refresh-token', async (req, res, next) => {
  try{
    const { refreshToken } = req.body
    if(!refreshToken) throw(err)
    const userId = await verifyRefreshToken(refreshToken)

    const accessToken = await signAccessToken(userId)
    const refToken = await signRefreshToken(userId)
    res.send({accessToken, refToken})
  }catch(error){
    next(error)
  }
})

router.post('/logout', verifyAccessToken, (req, res) => {

  res.status(200).send({ message: 'Logout successful' });
});



module.exports = router;
