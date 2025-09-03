'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SearchHistory extends Model {
    static associate(models) {
      SearchHistory.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  SearchHistory.init({
    userId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    keyword: DataTypes.STRING,
    type: DataTypes.ENUM('phone', 'email', 'name', 'address'),
    resultType: DataTypes.ENUM('set', 'single', 'empty'),
    state: DataTypes.ENUM('active', 'archived'),
    response: DataTypes.JSON,
    sort: DataTypes.JSON,
    offset: DataTypes.INTEGER,
    page: DataTypes.INTEGER,
    count: DataTypes.INTEGER,
    credits_used: DataTypes.INTEGER,
    filters: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'SearchHistory',
  });
  return SearchHistory;
};