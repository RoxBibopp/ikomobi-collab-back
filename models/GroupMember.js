const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./User');
const Group = require('./Group');

class GroupMember extends Model {}

GroupMember.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'refused', 'canceled'),
    defaultValue: 'accepted'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'GroupMember',
  tableName: 'GroupMembers'
});

GroupMember.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId', onDelete: 'CASCADE' });

module.exports = GroupMember;
