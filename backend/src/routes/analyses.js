const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analysisController = require('../controllers/analysisController');

// Get all analyses for user (with pagination)
router.get('/', auth, analysisController.listAnalyses);

// Get user statistics
router.get('/statistics', auth, analysisController.getStatistics);

// Get single analysis by ID
router.get('/:id', auth, analysisController.getAnalysis);

// Delete analysis
router.delete('/:id', auth, analysisController.deleteAnalysis);

module.exports = router;