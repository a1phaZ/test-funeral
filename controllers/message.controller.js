const {
  dbGetAll,
  dbGetAllMessages,
  dbCreateOne,
} = require('../db');

const {serializeMessages} = require('../db/handlers');

module.exports = {
  getMessages,
  createMessage
}

function getMessages(req, res, next) {
  dbGetAll(req)
    .then(({ rows }) => {
      const formatedRows = rows.map((row) => {
        return {...row, createdat: new Intl.DateTimeFormat('ru-RU').format(row.createdat)}
      })
      return res.status(200).json(serializeMessages(formatedRows))
    })
    .catch((err) => next(err));
}

function createMessage(req, res, next) {
  dbCreateOne(req)
    .then((row) => {
      return res.status(201).json({...row, createdat: new Intl.DateTimeFormat('ru-RU').format(row.createdat) })
    })
    .catch((err) => next(err));
}