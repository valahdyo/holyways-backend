const fs = require("fs")
path = require("path")
const { User, Fund, Transaction } = require("../../models")
const IMAGE_PATH = "http://localhost:5000/uploads/"

//Get all users
exports.getUsers = async (req, res) => {
  try {
    const user = await User.findAll({
      attributes: ["id", "fullName", "email"],
    })
    res.status(200).send({
      status: "success",
      data: {
        users: user,
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
    let user = await User.findOne({
      attributes: ["id", "fullName", "email", "phone", "profileImage"],
      where: { id: req.params.id },
      include: [
        {
          model: Transaction,
          as: "donateHistory",
          attributes: ["id", "donateAmount", "status", "createdAt"],
          include: [
            {
              model: Fund,
              as: "fundDetail",
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: Fund,
          as: "userFund",
        },
      ],
    })
    user = JSON.parse(JSON.stringify(user))
    if (user.profileImage) {
      user.profileImage = IMAGE_PATH + user.profileImage
    }
    res.status(200).send({
      status: "success",
      data: {
        user: user,
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
      const toUpdate = await User.findOne({ where: { id } })
      if (toUpdate.profileImage) {
        fs.unlinkSync(
          path.join(__dirname, "..", "..", "uploads", toUpdate.profileImage)
        )
      }
      await User.update(
        { ...req.body, profileImage: req.file.filename },
        {
          where: { id },
        }
      )
    } else {
      await User.update(
        { ...req.body },
        {
          where: { id },
        }
      )
    }

    let data = await User.findOne({
      where: { id },
      include: {
        model: Transaction,
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
    const user = await User.destroy({
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
    let data = await User.findOne({
      where: { id },
      include: {
        model: Fund,
        as: "userFund",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        include: {
          model: Transaction,
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
