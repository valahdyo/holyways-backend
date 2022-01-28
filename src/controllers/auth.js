const { User } = require('../../models')

const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')


//Login
exports.loginUser = async (req, res) => {
    //Validating
    const schema = Joi.object({
        email: Joi.string().email().min(3).required(),
        password: Joi.string().min(6).required(),
      });
      const { error } = schema.validate(req.body);

      if (error)
        return res.status(400).send({
          error: {
            message: error.details[0].message,
          },
        });
    const { email, password } = req.body

    try {
        
        const user = await User.findOne({
            where: {email},   
        })
        //Check password is valid
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
        return res.status(400).send({
            status: "Failed",
            message: "User or password is doesn't match",
        });
    }
    //Generate JWT Token when login success
    const accessToken = jwt.sign({ id: user.id }, process.env.SECRET_TOKEN, {
        expiresIn: 86400 // 24 hours
      });
        res.status(200).send({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email,
                    accessToken
                }
            }
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: "Failed",
            message: "User or password is doesn't match"
        })
    }
}

//Register
exports.registerUser = async (req, res) => {
    //Validating
    const schema = Joi.object({
        fullName: Joi.string().min(5).required(),
        email: Joi.string().email().min(3).required(),
        password: Joi.string().min(6).required(),
      });
      const { error } = schema.validate(req.body);
      if (error)
        return res.status(400).send({
          error: {
            message: error.details[0].message,
          },
        });
    const { fullName, email, password } = req.body

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword
        })
        const accessToken = jwt.sign({ id: user.id }, process.env.SECRET_TOKEN, {
            expiresIn: 86400 // 24 hours
          });
        res.status(200).send({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email,
                    accessToken
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            status: "Failed",
            message: "Register error"
        })
    }
}

exports.checkAuth = async (req, res) => {
    try { 
        const user = await User.findOne({
            where: {id: req.id.id}
        })
        res.status(200).send({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.status(404).send({
            status: "Failed",
            message: "Unauthorized"
        })
    }
}