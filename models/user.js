"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Transaction, {
        as: "donateHistory",
        foreignKey: "idUser",
      })
      User.hasMany(models.Fund, {
        as: "userFund",
        foreignKey: "idUser",
      })
      User.hasMany(models.Chat, {
        as: "senderMessage",
        foreignKey: {
          name: "idSender",
        },
      })
      User.hasMany(models.Chat, {
        as: "recipientMessage",
        foreignKey: {
          name: "idRecipient",
        },
      })
    }
  }
  User.init(
    {
      fullName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      gender: DataTypes.STRING,
      address: DataTypes.STRING,
      profileImage: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  )
  return User
}
