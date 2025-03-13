require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
const { sequelize } = require('./models');
require('./models/User');
require('./models/Group');
require('./models/GroupMember');

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const groupRoutes = require('./routes/groups');
app.use('/api/groups', groupRoutes);
const memberRoutes = require('./routes/members');
app.use('/api/members', memberRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('models synchro');
    app.listen(port, () => {
      console.log(`Serveur démarré`);
    });
  })
  .catch(err => console.error('Erreur:', err));

app.get('/', (req, res) => {
  res.send('Bienvenue');
});
