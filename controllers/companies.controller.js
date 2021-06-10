const {
  dbGetAll,
  dbCreateOne,
  dbGetOneById,
  dbUpdateOne,
} = require('../db');
const { serializeCompanyData, serializeArray } = require('../db/handlers');

const config = require('../config.json');

module.exports = {
  getCompanies,
  postCompany,
  getCompany,
  updateCompany,
  get,
  update,
  del,
};

function getCompanies(req, res, next) {
  dbGetAll(req)
    .then(({ rows }) => res.status(200).json(serializeArray(rows, serializeCompanyData)))
    .catch((err) => next(err));
}

function postCompany(req, res, next) {
  dbCreateOne(req)
    .then((row) => res.status(201).json(serializeCompanyData(row)))
    .catch((err) => next(err));
}

function getCompany(req, res, next) {
  dbGetOneById(req)
    .then((row) => res.status(200).json(serializeCompanyData(row)))
    .catch((err) => next(err));
}

function updateCompany(req, res, next) {
  dbUpdateOne(req)
    .then((row) => res.status(200).json(serializeCompanyData(row)))
    .catch((err) => next(err));
}

const company = {
  id: config.company_id,
  contactId: config.contact_id,
  name: 'ООО Фирма «Перспективные захоронения»',
  shortName: 'Перспективные захоронения',
  businessEntity: 'ООО',
  contract: {
    no: '12345',
    issue_date: '2015-03-12T00:00:00Z',
  },
  type: ['agent', 'contractor'],
  status: 'active',
  createdAt: '2020-11-21T08:03:00Z',
  updatedAt: '2020-11-23T09:30:00Z',
};

function get(req, res) {
  const URL = _getCurrentURL(req);
  company.photos = [{
    name: '0b8fc462dcabf7610a91.png',
    filepath: `${URL}0b8fc462dcabf7610a91.png`,
    thumbpath: `${URL}0b8fc462dcabf7610a91_160x160.png`,
  }];
  return res.status(200).json(company);
}

function update(req, res) {
  const requestBody = req.body;

  const URL = _getCurrentURL(req);
  company.photos = [{
    name: '0b8fc462dcabf7610a91.png',
    filepath: `${URL}0b8fc462dcabf7610a91.png`,
    thumbpath: `${URL}0b8fc462dcabf7610a91_160x160.png`,
  }];

  const updatedCompany = { ...company };
  Object.keys(requestBody).forEach((key) => {
    updatedCompany[key] = requestBody[key];
  });
  updatedCompany.updatedAt = new Date();

  return res.status(200).json(updatedCompany);
}

function del(req, res) {
  return res.status(200).end();
}

function _getCurrentURL(req) {
  const { port } = config;
  return `${req.protocol}://${req.hostname}${port === '80' || port === '443' ? '' : `:${port}`}/`;
}
