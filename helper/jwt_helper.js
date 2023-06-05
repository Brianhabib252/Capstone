const JWT = require ('jsonwebtoken')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const option = {
                expiresIn: '30d',
                issuer: 'test.com',
            } 
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) reject (err)
                resolve (token)
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return res.status(401).json({ message: 'No token provided' });
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
          if (err) {
            const message =
              err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
            return next(createError.Unauthorized(message))
          }
          req.payload = payload
          next()
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const option = {
                expiresIn: '1y',
                issuer: 'test.com',
            } 
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) reject (err)
                resolve (token)
            })
        })
    },

    verifyRefreshToken: (refreshToken) =>{
        JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) =>{
            if(err) return reject(err)
            const userId  = payload.aud

            resolve(userId)
        })
    }
}