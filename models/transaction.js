"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.fund, {
        as: "fundDetail",
        foreignKey: {
          name: "idFund",
        },
      })

      transaction.belongsTo(models.user, {
        as: "userDetail",
        foreignKey: {
          name: "idUser",
        },
      })
    }
  }
  transaction.init(
    {
      donateAmount: DataTypes.INTEGER,
      status: DataTypes.STRING,
      proofAttachment: DataTypes.STRING,
      idUser: DataTypes.INTEGER,
      idFund: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: "transactions",
      modelName: "transaction",
    }
  )
  return transaction
}
