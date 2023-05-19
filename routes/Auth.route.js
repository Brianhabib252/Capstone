const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const {signAccessToken} = require ('../helper/jwt_helper')
const validation = require('../helper/user.validation')

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'capstone',
    password: ''

})

router.post('/register', validation.CreateUser , async (req, res, next) => {
    
    const {email, password} = req.body
    const hash = await bcrypt.hash(password, 10)

    const query = "INSERT INTO users (email, hash) values (?, ?);"

    connection.query(query, [email, hash], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Insert Successful"})
        }
    })
})

router.post('/login', (req, res, next) => {
    res.send('product created')
})

router.post('/refresh-token', (req, res, next) => {
    res.send('getting a single product')
})

router.delete('/logout', (req, res, next) => {
    res.send('deleting a single product')
})

module.exports = router;