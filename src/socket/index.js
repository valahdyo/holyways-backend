const { Chat, User, Transaction, Fund } = require("../../models")
const IMAGE_PATH = "http://localhost:5000/uploads/"
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize")
const connectedUser = {}

const socketIo = (io) => {
  io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      next()
    } else {
      next(new Error("Not Authorized"))
    }
  })
  io.on("connection", (socket) => {
    console.log("client connect: ", socket.id)

    // get user connected id
    const userId = socket.handshake.query.id

    // save to connectedUser
    connectedUser[userId] = socket.id
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
              include: [
                {
                  model: Chat,
                  as: "recipientMessage",
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
                {
                  model: Chat,
                  as: "senderMessage",
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
              ],
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

    socket.on("load donor contacts", async (payload) => {
      try {
        let donorContact = await User.findAll({
          include: [
            {
              model: Chat,
              as: "recipientMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Chat,
              as: "senderMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
              where: { idRecipient: payload },
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

    socket.on("load messages", async (payload) => {
      try {
        const token = socket.handshake.auth.token

        const tokenKey = process.env.SECRET_TOKEN
        const verified = jwt.verify(token, tokenKey)

        const idRecipient = payload // catch recipient id sent from client
        const idSender = verified.id //id user

        const data = await Chat.findAll({
          where: {
            idSender: {
              [Op.or]: [idRecipient, idSender],
            },
            idRecipient: {
              [Op.or]: [idRecipient, idSender],
            },
          },
          include: [
            {
              model: User,
              as: "recipient",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
            {
              model: User,
              as: "sender",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
          ],
          order: [["createdAt", "ASC"]],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
          },
        })
        socket.emit("messages", data)
      } catch (error) {
        console.log(error)
      }
    })

    socket.on("send message", async (payload) => {
      try {
        const token = socket.handshake.auth.token

        const tokenKey = process.env.SECRET_TOKEN
        const verified = jwt.verify(token, tokenKey)

        const idSender = verified.id //id user
        const { message, idRecipient } = payload // catch recipient id and message sent from client

        await Chat.create({
          message,
          idRecipient,
          idSender,
        })

        // emit to just sender and recipient default rooms by their socket id
        io.to(socket.id)
          .to(connectedUser[idRecipient])
          .emit("new message", idRecipient)
      } catch (error) {
        console.log(error)
      }
    })

    socket.on("disconnect", () => {
      console.log("client disconnected", socket.id)
      delete connectedUser[userId]
    })
  })
}

module.exports = socketIo
