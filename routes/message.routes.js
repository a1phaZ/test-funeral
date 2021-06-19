const express = require('express');
const router = express.Router();

const messageController = require('../controllers/message.controller');

router.get(
  '/', 
  messageController.getMessages
);

router.post(
  '/', 
  messageController.createMessage
);

module.exports = router;
