const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');
const ROLES = require('../utils/roles');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/register', verifyToken, async (req, res) => {
    const { username, password, role, districtId } = req.body;
  
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
  
    try {
      const user = new User({
        username,
        password,
        role,
        district: role === ROLES.ADMIN ? null : districtId, 
      });
      await user.save();
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  });
  

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });

  try {
    const user = await User.findOne({ username });
    console.log('Retrieved user:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
});

  

module.exports = router;
