const Joi = require("joi")
const cloudinary = require("../utils/cloudinary")
const { user, fund, transaction } = require("../../models")
const IMAGE_PATH = `http://localhost:5000/uploads/`

//Add Transaction
exports.addTransaction = async (req, res) => {
  //Validating
  const schema = Joi.object({
    donateAmount: Joi.number().required(),
  })
  const { error } = schema.validate(req.body)

  if (error)
    return res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    })

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "holyways-img",
      use_filename: true,
      unique_filename: false,
    })
    await transaction.create({
      ...req.body,
      proofAttachment: result.public_id,
      idUser: req.id.id,
      idFund: req.params.idFund,
      status: "pending",
    })
    let data = await fund.findOne({
      where: { id: req.params.idFund },
      include: {
        model: transaction,
        as: "userDonate",
        include: {
          as: "userDetail",
          model: user,
          attributes: ["fullName", "email"],
        },
        attributes: ["id", "donateAmount", "status", "proofAttachment"],
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    })

    data = JSON.parse(JSON.stringify(data))
    if (data.userDonate) {
      data.userDonate.map((item) => {
        item.proofAttachment = process.env.PATH_FILE + req.file.filename
        return {
          ...item,
        }
      })
    }
    res.status(200).send({
      status: "success",
      data: {
        fund: { ...data, thumbnail: process.env.PATH_FILE + data.thumbnail },
      },
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .send({ status: "failed", msg: "Add transaction fund error" })
  }
}

exports.updateTransactionStatus = async (req, res) => {
  try {
    await transaction.update(req.body, {
      where: { id: req.params.idTransaction },
    })
    const data = await transaction.findOne({
      where: { id: req.params.idTransaction },
    })

    res.status(200).send({
      status: "success",
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ status: "failed", msg: "Cannot Update Status" })
  }
}
