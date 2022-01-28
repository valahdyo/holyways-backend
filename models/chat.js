"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat.belongsTo(models.User, {
        as: "sender",
        foreignKey: {
          name: "idSender",
        },
      })
      Chat.belongsTo(models.User, {
        as: "recipient",
        foreignKey: {
          name: "idRecipient",
        },
      })
    }
  }
  Chat.init(
    {
      message: DataTypes.TEXT,
      idSender: DataTypes.INTEGER,
      idRecipient: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: "chats",
      modelName: "Chat",
    }
  )
  return Chat
}
