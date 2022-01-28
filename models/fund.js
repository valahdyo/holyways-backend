"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Fund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Fund.hasMany(models.Transaction, {
        as: "userDonate",
        foreignKey: "idFund",
      })
      Fund.belongsTo(models.User, {
        as: "userFund",
        foreignKey: {
          name: "idUser",
        },
      })
    }
  }
  Fund.init(
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
      modelName: "Fund",
    }
  )
  return Fund
}
