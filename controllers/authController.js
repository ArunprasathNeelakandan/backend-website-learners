
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');


const signup = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'All fields required' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';

  db.run(sql, [name, email, hashedPassword, role], function (err) {
    if (err) return res.status(400).json({ error: 'Email already exists' });
    res.status(201).json({ message: 'User created successfully' });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (!user) {
      return res.status(401).json({ error: 'Email is wrong' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password is wrong' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  });
};

module.exports = { signup, login };
