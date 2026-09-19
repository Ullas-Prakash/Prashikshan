'use strict';

/**
 * Certificate Generation Service
 * ────────────────────────────────────────────────────────────────────────────
 * Uses pdfkit (PDF generation) and qrcode (QR code image buffer).
 * PDF is written to server/certs/ and the URL is stored on the Certificate
 * document so the public verify route can stream it.
 *
 * Certificate ID format:  CERT-<YYYY>-<6 UPPERCASE ALPHANUM>
 * e.g.  CERT-2026-A3K9PZ
 */

const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');
const PDFDoc = require('pdfkit');
const QRCode = require('qrcode');

const Certificate = require('../models/Certificate');

// Directory where PDFs are saved (created on first use)
const CERT_DIR = path.resolve(__dirname, '../certs');

function ensureCertDir() {
  if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });
}

// ─── ID generation ────────────────────────────────────────────────────────
function generateCertId() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `CERT-${year}-${rand}`;
}

// Guarantee uniqueness with a retry loop (collision probability is negligible
// but we handle it cleanly)
async function newUniqueCertId() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateCertId();
    const exists = await Certificate.exists({ certificateId: id });
    if (!exists) return id;
  }
  throw new Error('Failed to generate a unique certificate ID after 10 attempts.');
}

// ─── Colour palette ───────────────────────────────────────────────────────
const C = {
  emerald:    '#1c563e',
  emeraldLight:'#2b7550',
  mint:       '#d8f0e4',
  mintDeep:   '#a8d8bc',
  gold:       '#b8922a',
  goldLight:  '#f0e0a0',
  white:      '#ffffff',
  offWhite:   '#f8faf6',
  textDark:   '#172119',
  textMid:    '#3a5443',
  textLight:  '#6b7a6e',
  borderGray: '#dde5da',
};

// ─── PDF layout helpers ───────────────────────────────────────────────────

function hexToRGB(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function rgbFill(doc, hex) {
  doc.fillColor(hex);
}

function rgbStroke(doc, hex) {
  doc.strokeColor(hex);
}

// ─── Main generator ───────────────────────────────────────────────────────

/**
 * Generates a PDF certificate, saves it to disk, persists the Certificate
 * document, and updates the Enrollment.
 *
 * @param {object} opts
 *   studentName   {string}
 *   courseName    {string}
 *   courseCode    {string}
 *   credits       {number}
 *   studentId     {ObjectId|string}
 *   courseId      {ObjectId|string}
 *   enrollmentDoc {Enrollment Mongoose document} — mutated in place
 *   baseUrl       {string}  e.g. 'http://localhost:5000'
 * @returns {Promise<Certificate>}  the saved Certificate document
 */
async function issueCertificate({ studentName, courseName, courseCode, credits,
                                   studentId, courseId, enrollmentDoc, baseUrl }) {
  ensureCertDir();

  const certId      = await newUniqueCertId();
  const issuedAt    = new Date();
  const verifyUrl   = `${baseUrl}/verify/${certId}`;
  const pdfFilename = `${certId}.pdf`;
  const pdfPath     = path.join(CERT_DIR, pdfFilename);
  const pdfUrl      = `/api/certificates/pdf/${certId}`;

  // ── 1. Generate QR code as PNG buffer ──────────────────────────────────
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 160,
    margin: 1,
    color: { dark: C.emerald, light: C.white },
  });

  // ── 2. Build PDF (A4 landscape: 841 × 595 pt) ──────────────────────────
  await new Promise((resolve, reject) => {
    const doc = new PDFDoc({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      info: {
        Title:    `Prashikshan Certificate — ${courseName}`,
        Author:   'Prashikshan Platform',
        Subject:  `Course Completion Certificate`,
        Keywords: 'prashikshan, certificate, NEP, skill',
      },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);

    const W = 841, H = 595;

    // ── Background ──
    doc.rect(0, 0, W, H).fill(C.offWhite);

    // ── Emerald header bar ──
    doc.rect(0, 0, W, 90).fill(C.emerald);

    // ── Gold accent stripe ──
    doc.rect(0, 90, W, 5).fill(C.gold);

    // ── Inner border frame ──
    rgbStroke(doc, C.mintDeep);
    doc.rect(28, 28, W - 56, H - 56).lineWidth(1.5).stroke();
    doc.rect(32, 32, W - 64, H - 64).lineWidth(0.5).stroke();

    // ── Platform name in header ──
    doc.font('Helvetica-Bold').fontSize(11).fillColor(C.goldLight)
       .text('PRASHIKSHAN', 50, 22, { align: 'left' });
    doc.font('Helvetica').fontSize(8).fillColor(C.mint)
       .text('NEP-Aligned Career Pathway Platform', 50, 38);

    // ── "Certificate of Completion" heading ──
    doc.font('Helvetica').fontSize(11)
       .fillColor(C.gold)
       .text('CERTIFICATE OF COMPLETION', 0, 62, { align: 'center' });

    // ── Decorative sub-line ──
    const lineY = 110;
    rgbStroke(doc, C.mintDeep);
    doc.moveTo(60, lineY).lineTo(W - 60, lineY).lineWidth(0.8).stroke();

    // ── "This certifies that" ──
    doc.font('Helvetica').fontSize(11).fillColor(C.textLight)
       .text('This is to certify that', 0, 125, { align: 'center' });

    // ── Student name ──
    doc.font('Helvetica-Bold').fontSize(32).fillColor(C.emerald)
       .text(studentName, 80, 150, { width: 580, align: 'center' });

    // ── Divider under name ──
    const nameBottom = doc.y + 6;
    rgbStroke(doc, C.gold);
    doc.moveTo(200, nameBottom).lineTo(W - 200, nameBottom).lineWidth(1).stroke();

    // ── "has successfully completed" ──
    doc.font('Helvetica').fontSize(11).fillColor(C.textLight)
       .text('has successfully completed the course', 0, nameBottom + 14, { align: 'center' });

    // ── Course name ──
    doc.font('Helvetica-Bold').fontSize(20).fillColor(C.textDark)
       .text(courseName, 80, doc.y + 8, { width: 580, align: 'center' });

    // ── Course code + credits ──
    doc.font('Helvetica').fontSize(10).fillColor(C.textMid)
       .text(`Course Code: ${courseCode}  ·  NEP Academic Credits: ${credits}`,
             0, doc.y + 8, { align: 'center' });

    // ── Issued date ──
    const dateStr = issuedAt.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    doc.font('Helvetica').fontSize(9).fillColor(C.textLight)
       .text(`Issued on ${dateStr}`, 0, doc.y + 10, { align: 'center' });

    // ── Certificate ID pill ──
    const idY = doc.y + 14;
    doc.roundedRect(W/2 - 120, idY - 4, 240, 20, 4).fill(C.mint);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.emerald)
       .text(`Certificate ID: ${certId}`, W/2 - 120, idY, { width: 240, align: 'center' });

    // ── Signature line (left) ──
    const sigY = H - 95;
    rgbStroke(doc, C.textLight);
    doc.moveTo(80, sigY).lineTo(240, sigY).lineWidth(0.8).stroke();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.emerald)
       .text('Prashikshan Platform', 80, sigY + 6, { width: 160, align: 'center' });
    doc.font('Helvetica').fontSize(7).fillColor(C.textLight)
       .text('Authorised Signatory', 80, sigY + 18, { width: 160, align: 'center' });

    // ── Footer bar ──
    doc.rect(0, H - 46, W, 46).fill(C.emerald);
    doc.font('Helvetica').fontSize(7).fillColor(C.mint)
       .text(`Verify this certificate at: ${verifyUrl}`, 0, H - 32, { align: 'center' });
    doc.font('Helvetica').fontSize(6).fillColor(C.mintDeep)
       .text('Prashikshan · NEP 2020 Aligned · prashikshan.edu', 0, H - 18, { align: 'center' });

    // ── QR code (bottom-right) ──
    doc.image(qrBuffer, W - 195, H - 198, { width: 110, height: 110 });
    doc.font('Helvetica').fontSize(7).fillColor(C.textLight)
       .text('Scan to verify', W - 195, H - 82, { width: 110, align: 'center' });

    doc.end();
  });

  // ── 3. Persist Certificate document ──────────────────────────────────────
  const cert = await Certificate.create({
    certificateId: certId,
    student:       studentId,
    course:        courseId,
    issuedAt,
    status:        'VALID',
    pdfUrl,
  });

  // ── 4. Update enrollment ─────────────────────────────────────────────────
  enrollmentDoc.certificateId = certId;
  await enrollmentDoc.save();

  console.log(`[Certificate] Issued ${certId} for student ${studentId} — ${courseCode}`);
  return cert;
}

module.exports = { issueCertificate, CERT_DIR };
