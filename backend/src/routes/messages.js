const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');
const { createMessageValidation, idParamValidation } = require('../middleware/validation');

router.post('/', auth, createMessageValidation, messageController.createMessage);
router.get('/', auth, messageController.listMessages);
router.get('/:id', auth, idParamValidation, messageController.getMessage);

module.exports = router;