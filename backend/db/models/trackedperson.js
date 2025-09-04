'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TrackedPerson extends Model {
    static associate(models) {
      TrackedPerson.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  TrackedPerson.init({
    userId: DataTypes.INTEGER,
    dataAxleId: DataTypes.STRING,
    personData: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'TrackedPerson',
  });
  return TrackedPerson;
};