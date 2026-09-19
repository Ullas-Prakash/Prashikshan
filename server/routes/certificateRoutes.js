'use strict';

/**
 * Certificate Routes
 * ──────────────────────────────────────────────────────────────────────────
 * All endpoints here are intentionally PUBLIC (no requireAuth) so that:
 *  • Anyone can verify a certificate via the QR code scan or direct URL.
 *  • The PDF download link embedded in the certificate itself works without login.
 *
 * Private data (email, passwords, skill scores) is NEVER returned here.
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const Certificate    = require('../models/Certificate');
const { CERT_DIR }   = require('../services/certificateService');

const router = express.Router();

// ─── GET /api/certificates/verify/:certificateId ──────────────────────────
// Returns verification metadata only.  Used by VerifyCertificate.jsx and
// the QR code scan target.
// Response shape on success:
//   { valid: true, certificateId, studentName, courseName, issuedAt, status }
// Response shape on not-found:
//   { valid: false, reason: 'not_found' }
// Response shape on revoked:
//   { valid: false, reason: 'revoked', certificateId, issuedAt }
router.get('/verify/:certificateId', async (req, res, next) => {
  try {
    const id   = String(req.params.certificateId || '').trim().toUpperCase();
    if (!id)   return res.status(400).json({ valid: false, reason: 'not_found' });

    const cert = await Certificate.findOne({ certificateId: id })
      .populate('student', 'name')           // only name — no email or private fields
      .populate('course',  'title code credits');

    if (!cert) return res.status(404).json({ valid: false, reason: 'not_found' });

    if (cert.status === 'REVOKED') {
      return res.json({
        valid:         false,
        reason:        'revoked',
        certificateId: cert.certificateId,
        issuedAt:      cert.issuedAt,
      });
    }

    return res.json({
      valid:         true,
      certificateId: cert.certificateId,
      studentName:   cert.student?.name    || 'Unknown',
      courseName:    cert.course?.title    || 'Unknown',
      courseCode:    cert.course?.code     || '',
      credits:       cert.course?.credits  || 0,
      issuedAt:      cert.issuedAt,
      status:        cert.status,
    });
  } catch (e) { next(e); }
});

// ─── GET /api/certificates/pdf/:certificateId ─────────────────────────────
// Streams the generated PDF to the browser as an inline attachment.
// Still public — the certificate ID itself is the access token (unguessable).
router.get('/pdf/:certificateId', async (req, res, next) => {
  try {
    const id   = String(req.params.certificateId || '').trim().toUpperCase();
    const cert = await Certificate.findOne({ certificateId: id });
    if (!cert) return res.status(404).json({ error: 'Certificate not found.' });

    const pdfPath = path.join(CERT_DIR, `${id}.pdf`);
    if (!fs.existsSync(pdfPath))
      return res.status(404).json({ error: 'Certificate PDF not yet generated.' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${id}.pdf"`);
    fs.createReadStream(pdfPath).pipe(res);
  } catch (e) { next(e); }
});

module.exports = router;
