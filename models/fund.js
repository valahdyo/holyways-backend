"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class fund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      fund.hasMany(models.transaction, {
        as: "userDonate",
        foreignKey: "idFund",
      })
      fund.belongsTo(models.user, {
        as: "userFund",
        foreignKey: {
          name: "idUser",
        },
      })
    }
  }
  fund.init(
    {
      title: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      goal: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      targetDate: DataTypes.DATE,
      idUser: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: "funds",
      modelName: "fund",
    }
  )
  return fund
}
