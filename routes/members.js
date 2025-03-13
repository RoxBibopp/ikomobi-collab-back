const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');

router.post('/invite',
  auth,
  [
    body('groupId').notEmpty(),
    body('email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { groupId, email } = req.body;
    try {
      const group = await Group.findByPk(groupId);
      if (!group) return res.status(404).json({ message: 'Groupe non trouvé' });
      if (group.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
      
      const userToInvite = await User.findOne({ where: { email } });
      if (!userToInvite) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      
      const existant = await GroupMember.findOne({
        where: { groupId, userId: userToInvite.id }
      });
      
      if (existant && existant.status !== 'canceled') {
        return res.status(400).json({ message: 'Utilisateur déjà invité' });
      }
      
      if (existant && existant.status === 'canceled') {
        existant.status = 'pending';
        await existant.save();
        return res.json({ message: 'Invitation envoyée', invitation: existant });
      }
      
      const invitation = await GroupMember.create({
        groupId,
        userId: userToInvite.id,
        status: 'pending'
      });
      
      res.json({ message: 'Invitation envoyée', invitation });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err });
    }
  }
);

router.get('/invitations/pending', auth, async (req, res) => {
  try {
    const invitations = await GroupMember.findAll({
      where: {
        userId: req.user.id,
        status: 'pending'
      },
      include: [
        { model: Group, attributes: ['id', 'name', 'description'] }
      ]
    });
    res.json(invitations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

router.post('/invitations/respond',
  auth,
  [
    body('groupId').notEmpty(),
    body('response').isIn(['accepted', 'refused'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { groupId, response } = req.body;
    try {
      const invitation = await GroupMember.findOne({ where: { groupId, userId: req.user.id } });
      if (!invitation) return res.status(404).json({ message: 'Invitation non trouvée' });
      
      if (invitation.status !== 'pending') {
        return res.status(400).json({ message: 'Invitation déja répondue' });
      }
      
      invitation.status = response;
      await invitation.save();
      res.json({ message: `Invitation ${response}`, invitation });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err });
    }
  }
);

router.put('/invitations/cancel/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const invitation = await GroupMember.findByPk(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }
    
    invitation.status = 'canceled';
    await invitation.save();
    
    res.json({ message: 'Invitation annulée', invitation });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

router.get('/:groupId', auth, async (req, res) => {
  try {
    const groupMembers = await GroupMember.findAll({
      where: { 
        groupId: req.params.groupId,
        status: { [Op.ne]: 'canceled' }
      },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] }
      ]
    });
    console.log("Group members retournés :", groupMembers);
    res.json(groupMembers);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

module.exports = router;
