const Joi = require("joi")
const { User, Fund, Transaction } = require("../../models")
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
    await Transaction.create({
      ...req.body,
      proofAttachment: req.file.filename,
      idUser: req.id.id,
      idFund: req.params.idFund,
      status: "pending",
    })
    let data = await Fund.findOne({
      where: { id: req.params.idFund },
      include: {
        model: Transaction,
        as: "userDonate",
        include: {
          as: "userDetail",
          model: User,
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
        item.proofAttachment = IMAGE_PATH + req.file.filename
        return {
          ...item,
        }
      })
    }
    res.status(200).send({
      status: "success",
      data: {
        fund: { ...data, thumbnail: IMAGE_PATH + data.thumbnail },
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
    await Transaction.update(req.body, {
      where: { id: req.params.idTransaction },
    })
    const data = await Transaction.findOne({
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
