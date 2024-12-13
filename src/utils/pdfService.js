const PDFDocument = require('pdfkit');

const generateBirthCertificate = (data) => {
  const doc = new PDFDocument();
  doc.text(`Birth Certificate for ${data.name}`);
  return doc;
};
