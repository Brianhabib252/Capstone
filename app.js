const express = require('express')
const app = express()
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded ({extended: true}))
const { verifyAccessToken } = require('./helper/jwt_helper')

//const ProductRoute = require('./routes/Product.route');
const AuthRoute = require('./routes/Auth.route');

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send('Hello from express.')
  })

app.use('/auth', AuthRoute);

app.use((req, res, next) =>{
    const err = new Error("Not found")
    err.status = 404
    next(err)
})

//Error handler
app.use((err, req, res, next) =>{
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
    }

    })
})


app.listen(3000, () => {
    console.log('Server serving in port 3000')
})