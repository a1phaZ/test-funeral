const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');
const contactsController = require('../controllers/contacts.controller');

router.get(
  '/',
  auth,
  contactsController.getContacts,
);

router.post(
  '/',
  auth,
  contactsController.postContact,
);

router.get(
  '/:id',
  auth,
  contactsController.getContact,
);

router.patch(
  '/:id',
  auth,
  contactsController.updateContact,
);

router.delete(
  '/:id',
  auth,
  contactsController.deleteContact,
);

module.exports = router;
