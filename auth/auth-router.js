const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../users/users-model');
const secrets = require('../config/secrets');

const validateUser = require('./validate-user');

router.post("/register", (req, res) => {
  let user = req.body;
  const validation = validateUser(user, req.path);
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;

  if (validation.isSuccessful) {
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(err => res.status(500).json({ message: 'Failed to add user to database' }));
  } else {
    res.status(400).json({ message: 'Invalid credentials', errors: validation.errors });
  }
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;
  const validation = validateUser(req.body, req.path);

  if (validation.isSuccessful) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user);
  
          res.status(200).json({ message: `Welcome ${user.username}!`, token
          });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(err => res.status(500).json(err));
    } else {
      res.status(400).json({ message: 'Invalid credentials', errors: validation.errors });
    }
  });

function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username
  };
  const options = {
    expiresIn: '8h'
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}

module.exports = router;
