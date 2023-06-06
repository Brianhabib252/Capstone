const JWT = require ('jsonwebtoken')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
          const payload = {};
          const secret = process.env.ACCESS_TOKEN_SECRET;
          const expiresIn = '30d'; // Set the expiration time for the token
      
          JWT.sign(payload, secret, { expiresIn }, (err, token) => {
            if (err) reject(err);
            resolve(token);
          });
        });
      },
      verifyAccessToken: (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
      
        if (!token) {
          return res.status(401).json({ message: 'No token provided' });
        }
      
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
          if (err) {
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return res.status(401).json({ message });
          }
      
          // Check token expiration
          const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
          if (payload.exp <= currentTime) {
            return res.status(401).json({ message: 'Token has expired' });
          }
      
          req.payload = payload;
          next();
        });
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