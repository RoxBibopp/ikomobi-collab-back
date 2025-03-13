
# Plateforme Collaborative - Backend

Resultante du test technique pour Ikomobi, le sujet était la plateforme collaborative permettant aux utilisateurs de créer et gérer des groupes. 

Les utilisateurs peuvent s'inscrire, se connecter, créer des groupes, inviter des membres ( avec un système d'acceptation et de refus ) et gérer les membres de leurs propres groupes.

## Technologies utilisées



**Node.js** avec **Express** pour le serveur\
**MySQL** comme base de données\
**Sequelize** comme ORM\
**JWT** Pour l'authentification\
**bcrypt** pour le hash de mots de passe\
**express-validator** pour la validation des entrées



## Installation

### 1. Cloner le dépot

Cloner le dépot sur votre machine locale:


```bash
    git clone https://github.com/RoxBibopp/ikomobi-collab-back.git
    cd ikomobi-collab-back
```

### 2. Installer les dépendances


```bash
    npm install
```

### 3. Configurez l'environnement

Créez un fichier .env à la racine du projet. Ce fichier doit contenir les variables d'environnement nécessaires pour la connexion à la base de données, le port du serveur et la clé secrète pour JWT.

Exemple de fichier .env :

```bash
    PORT=3000
    DB_HOST=localhost
    DB_USER=votre_utilisateur_mysql
    DB_PASSWORD=votre_mot_de_passe_mysql
    DB_NAME=db_name
    JWT_SECRET=une_clé_secrète
```

### 4. Lancer le serveur

```bash
    npm run dev
    npm start
```

## Structure du projet

- **index.js** : Point d'entrée du serveur
- **models/** : Définition des models Sequelize (User, Group, etc...)
- **routes/** : Routes express pour l'authentification, la gestion des groupes, etc...
- **middlewares/** : middleware d'authentification via jwt
- **.env** : Ficher de configuration à créer manuellement


# Endpoints

## Authentification

- POST /api/auth/register : Inscription d'un nouvel utilisateur 
- POST /api/auth/login : Connexion d'un utilisateur 

## Gestion des groupes 

- POST /api/groups : Création d'un groupe.
- GET /api/groups : Récupération des groupes de l'utilisateur.
- GET /api/groups/:id : Récupération d'un groupe précis et de ses membres.
- DELETE /api/groups/:id : Suppression d'un groupe uniquement par le propriétaire du groupe.

## Gestion des membres & invitations

- POST /api/members/invite : Invitation d'un utilisateur à un groupe.
- GET /api/members/invitations/pending : Récupération des invitations en attente.
- POST /api/members/invitations/respond : Réponse à une invitation (accepter ou refuser).
- PUT /api/members/invitations/cancel/:invitationId : Annuler une invitation envoyée.
- DELETE /api/members/remove : Supprimer un membre d'un groupe.
