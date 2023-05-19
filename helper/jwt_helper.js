const JWT = require ('jsonwebtoken')

module.exports = {
    signAccessToken: (userid) => {
        return new Promise((resolve, reject) => {
            const payload = {
                name: "yours truly"
            }
            const secret = "some super secret"
            const option = {}
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) reject (err)
                resolve (token)
            })
        })
    }
}