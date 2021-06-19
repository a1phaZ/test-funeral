const { Pool } = require('pg');
const {
  getTableNameByReq,
  getQueryStringByQuery,
  getQueryParams,
} = require('./handlers');

require('dotenv')
  .config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.NODE_ENV === 'test' ? process.env.DATABASE_TEST : process.env.DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

function createError(code, message) {
  const error = new Error(message);
  error.statusCode = code;
  return error;
}

/**
 * Функция получения всех записей из БД
 * @param req
 * @returns {Promise<[]>}
 */
function dbGetAll(req) {
  return new Promise((resolve, reject) => {
    const table = getTableNameByReq(req);
    const qs = getQueryStringByQuery(req);
    pool.query(`SELECT * FROM ${table} ${qs}`)
      .then((results) => resolve(results))
      .catch((err) => reject(err));
  });
}

function dbGetAllMessages() {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM messages AS m LEFT JOIN comments AS c ON m.id = c.comment_by`)
      .then((results) => resolve(results))
      .catch((err) => reject(err));
  })
}

/**
 * Функция получения записи из БД по id
 * @param req
 * @returns {Promise<{}>}
 */
function dbGetOneById(req) {
  return new Promise((resolve, reject) => {
    const table = getTableNameByReq(req);
    const { id } = req.params;
    pool.query(`SELECT * FROM ${table} WHERE id = ${id}`)
      .then(({ rows }) => {
        if (rows.length !== 0) {
          resolve(rows[0]);
        }
        reject(createError(404, 'По данному id ни чего не найдено'));
      })
      .catch((err) => reject(err));
  });
}

/**
 * Функция получения записи из БД по параметру
 * @param req
 * @param param
 * @returns {Promise<{}>}
 */
function dbGetOneByParam(req, param) {
  return new Promise((resolve, reject) => {
    const table = getTableNameByReq(req);
    const { body } = req;
    pool.query(`SELECT * FROM ${table} WHERE ${param} = '${body[param]}'`)
      .then(({ rows }) => {
        if (rows.length !== 0) {
          resolve(rows[0]);
        }
        reject(createError(404, 'По данному параметру ни чего не найдено'));
      })
      .catch((err) => reject(err));
  });
}

/**
 * Функция созданич записи в БД
 * @param req
 * @returns {Promise<{}>}
 */
function dbCreateOne(req) {
  return new Promise((resolve, reject) => {
    const {
      table, namesValues, namesQuery, values,
    } = getQueryParams(req);
    pool.query(
      `INSERT INTO ${table} 
      (${namesQuery})
      VALUES (${values}) 
      RETURNING *`,
      namesValues,
    )
      .then(({ rows }) => resolve(rows[0]))
      .catch((err) => reject(err));
  });
}

/**
 * Функция обновления записи в БД по id
 * @param req
 * @returns {Promise<{}>}
 */
function dbUpdateOne(req) {
  return new Promise((resolve, reject) => {
    const {
      table, namesValues, namesQuery, values,
    } = getQueryParams(req);
    const {
      params: {
        id,
      },
    } = req;
    pool.query(
      `UPDATE ${table}
      SET (${namesQuery}) = (${values})
      WHERE id = ${id}
      RETURNING *`,
      namesValues,
    )
      .then(({ rows }) => {
        if (rows.length !== 0) {
          resolve(rows[0]);
        }
        reject(createError(404, 'По данному id ни чего не найдено'));
      })
      .catch((err) => reject(err));
  });
}

/**
 * Функция удаления записи из БД по id
 * @param req
 * @returns {Promise<{}>}
 */
function dbDeleteOne(req) {
  return new Promise((resolve, reject) => {
    const table = getTableNameByReq(req);
    const {
      params: {
        id,
      },
    } = req;
    pool.query(
      `DELETE FROM ${table}
      WHERE id = ${id}`,
    )
      .then(() => resolve({ deleted: true, deletedId: +id }))
      .catch((err) => reject(err));
  });
}

/**
 * Вспомогательная функция для тестов
 * @param table
 * @returns {Promise<void>}
 */
async function dbDeleteAll(table) {
  await pool.query(`DELETE FROM ${table}`);
}

module.exports = {
  dbGetAll,
  dbCreateOne,
  dbGetOneById,
  dbUpdateOne,
  dbDeleteOne,
  dbGetOneByParam,
  dbDeleteAll,
  dbGetAllMessages,
  pool,
};
