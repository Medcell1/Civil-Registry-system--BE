const express = require('express');
const PDFDocument = require('pdfkit');
const Record = require('../models/Record');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const record = await Record.findById(id).populate('district createdBy');
    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (
      req.user.role !== 'ADMIN' &&
      record.district.toString() !== req.user.district.toString()
    ) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${record.type}-${record._id}.pdf`);

    doc.fontSize(16).text(`Civil Record (${record.type})`, { align: 'center' });
    doc.moveDown();
    doc.text(`Details: ${JSON.stringify(record.details, null, 2)}`);
    doc.text(`District: ${record.district.name}`);
    doc.text(`Created By: ${record.createdBy.username}`);
    doc.text(`Created At: ${record.createdAt}`);
    doc.end();

    doc.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF', error });
  }
});

module.exports = router;
