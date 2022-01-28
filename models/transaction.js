'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.Fund, {
        as: "fundDetail",
        foreignKey: {
          name: "idFund",
        },
      });

      Transaction.belongsTo(models.User, {
        as: "userDetail",
        foreignKey: {
          name: "idUser",
        },
      });

    }
  };
  Transaction.init({
    donateAmount: DataTypes.INTEGER,
    status: DataTypes.STRING,
    proofAttachment: DataTypes.STRING,
    idUser: DataTypes.INTEGER,
    idFund: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'transactions',
    modelName: 'Transaction',
  });
  return Transaction;
};