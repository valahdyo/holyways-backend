const fs = require("fs")
path = require("path")
const { User, Fund, Transaction } = require("../../models")

const Joi = require("joi")
const IMAGE_PATH = `http://localhost:5000/uploads/`

//Get all funds
exports.getFunds = async (req, res) => {
  try {
    let data = await Fund.findAll({
      include: {
        model: Transaction,
        as: "userDonate",
        include: {
          model: User,
          as: "userDetail",
          attributes: ["fullName", "email"],
        },
        attributes: ["id", "donateAmount", "status", "proofAttachment"],
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    })
    //Add Image path to image name
    data = JSON.parse(JSON.stringify(data))
    data = data.map((trx) => {
      trx.thumbnail = IMAGE_PATH + trx.thumbnail
      if (trx.userDonate) {
        trx.userDonate.map((user) => {
          user.proofAttachment = IMAGE_PATH + user.proofAttachment
          return { ...user }
        })
        return { ...trx }
      }
    })

    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ status: "failed", msg: "Get fund error" })
  }
}

// Add Fund
exports.addFund = async (req, res) => {
  //Validating
  const schema = Joi.object({
    title: Joi.string().required(),
    goal: Joi.number().required(),
    description: Joi.string().min(5).required(),
    targetDate: Joi.date().iso().required(),
    idUser: Joi.number().required(),
  })
  console.log(req.body)
  const { error } = schema.validate(req.body)

  if (error)
    return res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    })

  try {
    const newFund = await Fund.create({
      ...req.body,
      thumbnail: req.file.filename,
    })
    let data = await Fund.findOne({
      where: { id: newFund.id },
      include: {
        model: Transaction,
        as: "userDonate",
        include: {
          model: User,
          as: "userDetail",
          attributes: ["fullName", "email"],
        },
        attributes: ["id", "donateAmount", "status", "proofAttachment"],
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    })

    //Add Image Path to image thumbnail
    data = JSON.parse(JSON.stringify(data))
    data.thumbnail = IMAGE_PATH + data.thumbnail
    if (data.userDonate) {
      data.userDonate.map((user) => {
        user.proofAttachment = IMAGE_PATH + user.proofAttachment
        return { ...user }
      })
    }

    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ status: "failed", msg: "Add fund error" })
  }
}

//Get Detail Fund
exports.getFund = async (req, res) => {
  const { id } = req.params
  try {
    let data = await Fund.findOne({
      where: { id },
      include: {
        model: Transaction,
        as: "userDonate",
        include: {
          model: User,
          as: "userDetail",
          attributes: ["fullName", "email"],
        },
        attributes: [
          "id",
          "donateAmount",
          "status",
          "proofAttachment",
          "createdAt",
        ],
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    })

    //Add Image Path to image thumbnail
    data = JSON.parse(JSON.stringify(data))
    data.thumbnail = IMAGE_PATH + data.thumbnail
    if (data.userDonate) {
      data.userDonate.map((user) => {
        user.proofAttachment = IMAGE_PATH + user.proofAttachment
        return { ...user }
      })
    }

    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ status: "failed", msg: "Get fund error" })
  }
}

//Delete Fund
exports.deleteFund = async (req, res) => {
  const { id } = req.params
  try {
    const toUpdate = await Fund.findOne({ where: { id } })
    if (toUpdate.thumbnail) {
      fs.unlinkSync(
        path.join(__dirname, "..", "..", "uploads", toUpdate.thumbnail)
      )
    }
    const user = await Fund.destroy({
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
      message: `Cannot delete fund with id ${id}`,
    })
  }
}

//Edit Fund
exports.updateFund = async (req, res) => {
  try {
    const { id } = req.params
    if (req.file) {
      const toUpdate = await Fund.findOne({ where: { id } })
      if (toUpdate.thumbnail) {
        fs.unlinkSync(
          path.join(__dirname, "..", "..", "uploads", toUpdate.thumbnail)
        )
      }
      await Fund.update(
        { ...req.body, thumbnail: req.file.filename },
        {
          where: { id },
        }
      )
    } else {
      await Fund.update(req.body, {
        where: { id },
      })
    }
    let data = await Fund.findOne({
      where: { id },
      include: {
        model: Transaction,
        as: "userDonate",
        include: {
          model: User,
          as: "userDetail",
          attributes: ["fullName", "email"],
        },
        attributes: ["id", "donateAmount", "status", "proofAttachment"],
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    })

    //Add Image Path to image thumbnail
    data = JSON.parse(JSON.stringify(data))
    data.thumbnail = IMAGE_PATH + data.thumbnail
    if (data.userDonate) {
      data.userDonate.map((user) => {
        user.proofAttachment = IMAGE_PATH + user.proofAttachment
        return { ...user }
      })
    }
    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ status: "failed", msg: "Edit fund error" })
  }
}

//Edit user donate by fund
exports.updateUserDonate = async (req, res) => {
  try {
    const { idFund, idUser, idTransaction } = req.params

    if (req.file) {
      await Transaction.update(
        { ...req.body, proofAttachment: req.file.filename },
        {
          where: { idFund, idUser, id: idTransaction },
        }
      )
    } else {
      await Transaction.update(req.body, {
        where: { idFund, idUser, id: idTransaction },
      })
    }
    let data = await Fund.findOne({
      where: { id: idFund },
      include: {
        model: Transaction,
        as: "userDonate",
        include: {
          model: User,
          as: "userDetail",
          attributes: ["fullName", "email"],
        },
        attributes: ["id", "donateAmount", "status", "proofAttachment"],
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    })

    //Add Image Path to image thumbnail
    data = JSON.parse(JSON.stringify(data))
    data.thumbnail = IMAGE_PATH + data.thumbnail
    if (data.userDonate) {
      data.userDonate.map((user) => {
        user.proofAttachment = IMAGE_PATH + user.proofAttachment
        return { ...user }
      })
    }
    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .send({ status: "failed", msg: "Update donate by fund error" })
  }
}
