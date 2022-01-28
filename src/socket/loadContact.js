const { Fund, Chat, Transaction, User } = require("../../models")
const IMAGE_PATH = "http://localhost:5000/uploads/"

exports.loadFundraiser = (payload) => {
  socket.on("load fundraiser contact", async (payload) => {
    try {
      let fundraiserContact = await Fund.findOne({
        include: [
          {
            model: User,
            as: "userFund",
            attributes: {
              exclude: ["createdAt", "updatedAt", "password"],
            },
          },
        ],
        where: {
          id: payload.idFund,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      })

      fundraiserContact = JSON.parse(JSON.stringify(fundraiserContact))
      if (fundraiserContact.userFund.profileImage) {
        fundraiserContact.userFund.profileImage =
          IMAGE_PATH + fundraiserContact.userFund.profileImage
      }
      socket.emit("fundraiser contact", fundraiserContact.userFund)
    } catch (err) {
      console.log(err)
    }
  })
}

exports.loadDonor = () => {
  socket.on("load donor contacts", async () => {
    try {
      let donorContact = await User.findAll({
        include: [
          {
            model: Chat,
            as: "recipientMessage",
            attributes: {
              exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
            },
          },
          {
            model: Chat,
            as: "senderMessage",
            attributes: {
              exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
            },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      })

      donorContact = JSON.parse(JSON.stringify(donorContact))
      donorContact.map((item, index) => {
        if (item.profileImage) {
          item.profileImage = IMAGE_PATH + item.profileImage
        }
      })
      socket.emit("donor contacts", donorContact)
    } catch (err) {
      console.log(err)
    }
  })
}
