const express = require('express');
const District = require('../models/District');
const { verifyToken, checkRole } = require('../middleware/auth');
const ROLES = require('../utils/roles');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { name } = req.body;

  try {
    const district = new District({ name });
    await district.save();
    res.status(201).json({ message: 'District created successfully', district });
  } catch (error) {
    res.status(500).json({ message: 'Error creating district', error });
  }
});
router.get('/', verifyToken, async (req, res) => {
  try {
    const districts = await District.find(); 
    res.status(200).json(districts); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching districts', error });
  }
})

module.exports = router;
