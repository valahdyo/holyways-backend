const { user } = require("../../models")

//Check if email already exist
exports.checkDuplicateEmail = async (req, res, next) => {
  const { email } = req.body
  try {
    const userExist = await user.findOne({
      where: { email },
    })
    if (userExist) {
      return res.status(409).send({
        status: "Failed",
        message: "Email is already in use!",
      })
    }
    next()
  } catch (error) {
    res.status(400).send({
      status: "Not valid",
      message: "Register validation error",
    })
  }
}
