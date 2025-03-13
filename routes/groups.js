const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { Op } = require('sequelize');

router.post('/',
  auth,
  [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('description').optional()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const group = await Group.create({
        name: req.body.name,
        description: req.body.description,
        creatorId: req.user.id
      });
      await GroupMember.create({ groupId: group.id, userId: req.user.id });
      res.json(group);
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const memberships = await GroupMember.findAll({ 
      where: { 
        userId: req.user.id,
        status: 'accepted'
      }
    });
    const groupIds = memberships.map(m => m.groupId);
    const groups = await Group.findAll({ where: { id: groupIds } });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err });
  }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Groupe non trouvé' });
    }

    const membership = await GroupMember.findOne({
      where: { groupId: req.params.id, userId: req.user.id }
    });
    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const members = await GroupMember.findAll({
      where: { 
        groupId: req.params.id,
        status: { [Op.ne]: 'canceled' }
      },
      include: [
        {
          model: require('../models/User'),
          attributes: ['name', 'email']
        }
      ]
    });

    res.json({ group, members });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe non trouvé' });
    if (group.creatorId !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    await GroupMember.destroy({ where: { groupId: group.id } });
    
    await group.destroy();
    res.json({ message: 'Groupe supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

module.exports = router;
