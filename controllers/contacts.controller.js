const config = require('../config.json');
const {
  dbGetAll,
  dbCreateOne,
  dbUpdateOne,
  dbGetOneById,
  dbDeleteOne,
} = require('../db');

module.exports = {
  get,
  update,
  getContacts,
  postContact,
  getContact,
  updateContact,
  deleteContact,
};

const contact = {
  id: config.contact_id,
  lastname: 'Григорьев',
  firstname: 'Сергей',
  patronymic: 'Петрович',
  phone: '79162165588',
  email: 'grigoriev@funeral.com',
  createdAt: '2020-11-21T08:03:26.589Z',
  updatedAt: '2020-11-23T09:30:00Z',
};

function getContacts(req, res, next) {
  dbGetAll(req)
    .then(({ rows }) => res.status(200).json(rows))
    .catch((err) => next(err));
}

function getContact(req, res, next) {
  dbGetOneById(req)
    .then((row) => res.status(200).json(row))
    .catch((err) => next(err));
}

function postContact(req, res, next) {
  dbCreateOne(req)
    .then((row) => res.status(201).json(row))
    .catch((err) => next(err));
}

function updateContact(req, res, next) {
  dbUpdateOne(req)
    .then((row) => res.status(200).json(row))
    .catch((err) => next(err));
}

function deleteContact(req, res, next) {
  dbDeleteOne(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err));
}

function get(req, res) {
  return res.status(200).json(contact);
}

function update(req, res) {
  const requestBody = req.body;

  const updatedContact = { ...contact };
  Object.keys(requestBody).forEach((key) => {
    updatedContact[key] = requestBody[key];
  });
  updatedContact.updatedAt = new Date();

  return res.status(200).json(updatedContact);
}
