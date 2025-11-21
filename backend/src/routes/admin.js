const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Phishing URLs management
router.post('/phishing-urls', auth, adminController.addUrl);
router.get('/phishing-urls', auth, adminController.listUrls);
router.delete('/phishing-urls/:id', auth, adminController.deleteUrl);

// Reports management
router.get('/reports', auth, adminController.getReports);
router.get('/reports/:id', auth, adminController.getReportById);
router.patch('/reports/:id', auth, adminController.updateReportStatus);

// Message submissions
router.get('/submissions', auth, adminController.getSubmissions);
router.get('/submissions/:id', auth, adminController.getSubmissionById);

// Statistics
router.get('/statistics', auth, adminController.getStatistics);

module.exports = router;