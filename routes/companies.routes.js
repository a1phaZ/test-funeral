const express = require('express');
const multer = require('multer');
const config = require('../config.json');

const fileHandler = multer({ dest: config.uploads_dir });
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const companiesController = require('../controllers/companies.controller');

const filesParamsValidator = require('../middleware/validators/files.params.validator');
const filesController = require('../controllers/files.controller');

router.get(
  '/',
  auth,
  companiesController.getCompanies,
);

router.post(
  '/',
  auth,
  companiesController.postCompany,
);

router.get(
  '/:id',
  auth,
  companiesController.getCompany,
);

router.patch(
  '/:id',
  auth,
  companiesController.updateCompany,
);

router.post(
  '/:id/image',
  auth,
  fileHandler.fields([{ name: 'file', maxCount: 1 }]),
  filesParamsValidator.addCompanyImage,
  filesController.saveImage,
);

router.delete(
  '/:id/image/:image_name',
  auth,
  filesParamsValidator.removeCompanyImage,
  filesController.removeImage,
);

module.exports = router;
