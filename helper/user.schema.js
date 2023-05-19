const Joi = require('@hapi/joi')

const schema = {
    create: Joi.object({
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(2).required(),
        hash: Joi.string().min(1)
    })
}

module.exports = schema;