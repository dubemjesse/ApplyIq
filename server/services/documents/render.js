const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");

// A section heading is a short, all-caps line (e.g. "PROFESSIONAL SUMMARY").
function isHeading(line) {
  const trimmed = line.trim();
  return trimmed.length > 0 && trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
}

/**
 * @param {string} title
 * @param {string} bodyText
 * @returns {Promise<Buffer>}
 */
function renderPdf(title, bodyText) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).font("Helvetica-Bold").text(title);
    doc.moveDown();

    for (const line of bodyText.split("\n")) {
      if (line.trim() === "") {
        doc.moveDown(0.5);
        continue;
      }
      if (isHeading(line)) {
        doc.moveDown(0.5).fontSize(13).font("Helvetica-Bold").text(line.trim());
        doc.font("Helvetica").fontSize(11);
      } else {
        doc.text(line.trim());
      }
    }

    doc.end();
  });
}

/**
 * @param {string} title
 * @param {string} bodyText
 * @returns {Promise<Buffer>}
 */
async function renderDocx(title, bodyText) {
  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: "" }),
  ];

  for (const line of bodyText.split("\n")) {
    if (line.trim() === "") {
      children.push(new Paragraph({ text: "" }));
    } else if (isHeading(line)) {
      children.push(new Paragraph({ text: line.trim(), heading: HeadingLevel.HEADING_2 }));
    } else {
      children.push(new Paragraph({ children: [new TextRun(line.trim())] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

module.exports = { renderPdf, renderDocx };
