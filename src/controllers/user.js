const fs = require("fs")
path = require("path")
const { user, fund, transaction } = require("../../models")
const IMAGE_PATH = "http://localhost:5000/uploads/"

//Get all users
exports.getUsers = async (req, res) => {
  try {
    const foundUser = await user.findAll({
      attributes: ["id", "fullName", "email"],
    })
    res.status(200).send({
      status: "success",
      data: {
        users: foundUser,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: "Failed",
      message: "Cannot get all users",
    })
  }
}

exports.getUser = async (req, res) => {
  try {
    let foundUser = await user.findOne({
      attributes: ["id", "fullName", "email", "phone", "profileImage"],
      where: { id: req.params.id },
      include: [
        {
          model: transaction,
          as: "donateHistory",
          attributes: ["id", "donateAmount", "status", "createdAt"],
          include: [
            {
              model: fund,
              as: "fundDetail",
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: fund,
          as: "userFund",
        },
      ],
    })
    foundUser = JSON.parse(JSON.stringify(foundUser))
    if (foundUser.profileImage) {
      foundUser.profileImage = IMAGE_PATH + foundUser.profileImage
    }
    res.status(200).send({
      status: "success",
      data: {
        user: foundUser,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: "Failed",
      message: "Cannot get user",
    })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const id = req.id.id
    if (req.file) {
      const toUpdate = await user.findOne({ where: { id } })
      if (toUpdate.profileImage) {
        fs.unlinkSync(
          path.join(__dirname, "..", "..", "uploads", toUpdate.profileImage)
        )
      }
      await user.update(
        { ...req.body, profileImage: req.file.filename },
        {
          where: { id },
        }
      )
    } else {
      await user.update(
        { ...req.body },
        {
          where: { id },
        }
      )
    }

    let data = await user.findOne({
      where: { id },
      include: {
        model: transaction,
        as: "donateHistory",
        attributes: ["id", "donateAmount", "status"],
      },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "password",
          "address",
          "gender",
          "password",
        ],
      },
    })

    //Add Image Path to image thumbnail
    data = JSON.parse(JSON.stringify(data))
    if (data.profileImage) {
      data.profileImage = IMAGE_PATH + data.profileImage
    }
    res.status(200).send({
      status: "success",
      data: {
        user: data,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: "Failed",
      message: `Cannot update ${req.id.id} users`,
    })
  }
}

//Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params
  try {
    const foundUser = await user.destroy({
      where: { id },
    })
    res.status(200).send({
      status: "success",
      data: {
        id,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: "Failed",
      message: `Cannot delete ${id} users`,
    })
  }
}

exports.getFundByUser = async (req, res) => {
  const { id } = req.params
  try {
    let data = await user.findOne({
      where: { id },
      include: {
        model: fund,
        as: "userFund",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        include: {
          model: transaction,
          as: "userDonate",
          attributes: {
            exclude: ["createdAt", "updatedAt", "proofAttachment"],
          },
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    })

    //Add Image Path to image thumbnail
    data = JSON.parse(JSON.stringify(data))
    if (data.userFund) {
      data.userFund.map((user) => {
        user.thumbnail = IMAGE_PATH + user.thumbnail
        return { ...user }
      })
    }

    res.status(200).send({
      status: "success",
      data: {
        user: data,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ status: "failed", msg: "Get fund by user error" })
  }
}
