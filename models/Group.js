const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./User');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

Group.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

module.exports = Group;
