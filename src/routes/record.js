const express = require('express');
const Record = require('../models/Record');
const District = require('../models/District');
const { verifyToken, checkRole } = require('../middleware/auth');
const ROLES = require('../utils/roles');

const router = express.Router();

router.post('/', verifyToken, checkRole(ROLES.SUPERVISOR), async (req, res) => {
  const { type, details, districtId } = req.body;

  try {
    if (req.user.district.toString() !== districtId) {
      return res.status(403).json({ message: 'Access to this district is forbidden' });
    }

    const record = new Record({
      type,
      details,
      district: districtId,
      createdBy: req.user.id,
    });
    await record.save();

    const district = await District.findById(districtId);
    district.records.push(record._id);
    await district.save();

    res.status(201).json({ message: 'Record created successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Error creating record', error });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const { districtId, type, from, to } = req.query;
  const filters = {};

  if (districtId) filters.district = districtId;
  if (type) filters.type = type;
  if (from || to) {
    filters.createdAt = {};
    if (from) filters.createdAt.$gte = new Date(from);
    if (to) filters.createdAt.$lte = new Date(to);
  }

  if (req.user.role === ROLES.SUPERVISOR || req.user.role === ROLES.ANALYTICS) {
    filters.district = req.user.district;
  }

  try {
    const records = await Record.find(filters).populate('createdBy district');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error });
  }
});

router.put('/:id', verifyToken, checkRole(ROLES.SUPERVISOR), async (req, res) => {
  const { id } = req.params;
  const { details } = req.body;

  try {
    const record = await Record.findById(id);

    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.district.toString() !== req.user.district.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    record.details = details;
    await record.save();

    res.status(200).json({ message: 'Record updated successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Error updating record', error });
  }
});

router.delete('/:id', verifyToken, checkRole(ROLES.ADMIN), async (req, res) => {
  const { id } = req.params;

  try {
    const record = await Record.findByIdAndDelete(id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    await District.updateOne(
      { records: record._id },
      { $pull: { records: record._id } }
    );

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error });
  }
});

module.exports = router;
