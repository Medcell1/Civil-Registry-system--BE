const express = require('express');
const Record = require('../models/Record');
const { verifyToken, checkRole } = require('../middleware/auth');
const ROLES = require('../utils/roles');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const filters = req.user.role === ROLES.ADMIN ? {} : { district: req.user.district };

  try {
    const totalRecords = await Record.countDocuments(filters);
    const byType = await Record.aggregate([
      { $match: filters },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const byDistrict = req.user.role === ROLES.ADMIN
      ? await Record.aggregate([
          { $group: { _id: '$district', count: { $sum: 1 } } },
        ])
      : null;

    res.status(200).json({ totalRecords, byType, byDistrict });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
});

module.exports = router;
