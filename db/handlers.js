const config = require('../config.json');

module.exports = {
  getQueryParams,
  getQueryStringByQuery,
  getTableNameByReq,
  serializeCompanyData,
  serializeArray,
  serializeMessages,
  postApi: testPostApi,
  getApi: testGetApi,
  patchApi: testPatchApi,
  deleteApi: testDeleteApi,
};

/**
 * Получаем строку запроса к базе данных
 * @param query
 * @returns {string}
 */
function getQueryStringByQuery({ query }) {
  let qs = '';
  const {
    filter, value, sort, direction, limit = config.rows_per_page, page = 1,
  } = query;
  const offset = limit * (page - 1);
  if (filter && (filter === 'status' || filter === 'type')) qs += `WHERE ${filter} = '${value}' `;
  if (
    (sort && direction)
    && (sort === 'name' || sort === 'createdAt')
    && (direction === 'asc' || direction === 'desc')
  ) {
    qs += `ORDER BY ${sort} ${direction.toUpperCase()} `;
  }
  if (!sort || !direction) {
    qs += 'ORDER BY id ASC ';
  }
  qs += `LIMIT ${limit} OFFSET ${offset}`;

  return qs;
}

/**
 * Получаем имя таблицы из url запроса
 * @param req
 * @returns {string}
 */
function getTableNameByReq(req) {
  return req.baseUrl.replace(/\//, '');
}

/**
 * Получаем имена полей таблицы из перечисляемых свойств тела запроса
 * @param entries
 * @returns {*[]}
 */
function getNames(entries) {
  const names = [];
  return names.concat.apply(
    [],
    entries.map((entry) => {
      if ((typeof entry[1] === 'object') && (!Array.isArray(entry[1]))) return getNames(Object.entries(entry[1]));
      return entry[0];
    }),
  );
}

/**
 * Получаем значения для записи в базу данных из значений тела запроса
 * @param values
 * @returns {[]}
 */
function getValues(values) {
  const cleanValues = [];
  values.forEach((value) => {
    if ((typeof value === 'object') && (!Array.isArray(value))) {
      return Object.values(value)
        .forEach((val) => {
          cleanValues.push(val);
        });
    }
    return cleanValues.push(value);
  });

  return cleanValues;
}

/**
 * Получение параметров для запроса в POST || PATCH
 * @param req
 * @returns {{namesValues: *[], values: string, namesQuery: string, table: string}}
 */
function getQueryParams(req) {
  const { body, method } = req;
  if (method !== 'PATCH') {
    body.createdAt = new Date().toISOString();
  }
  body.updatedAt = new Date().toISOString();
  const table = getTableNameByReq(req);
  const names = getNames(Object.entries(req.body));
  const namesValues = getValues(Object.values(req.body));
  const namesQuery = names.join(', ');
  const values = names.map((name, key) => `$${key + 1}`)
    .join(', ');
  return {
    table,
    namesValues,
    namesQuery,
    values,
  };
}

/**
 * Сеарилизация объекта компании
 * @param data
 * @returns {{}}
 */
function serializeCompanyData(data) {
  if (!data) return {};
  return {
    id: data.id,
    contactId: data.contactid,
    name: data.name,
    shortName: data.shortname,
    businessEntity: data.businessentity,
    contract: {
      no: data.no.toString(),
      issue_date: data.issue_date,
    },
    type: data.type,
    status: data.status,
    address: data.address,
    createdAt: data.createdat,
    updatedAt: data.updatedat,
  };
}

function serializeArray(array, func) {
  return array.map((row) => func(row));
}

function serializeMessages(array) {
  const commentList = array.filter((message) => !!message.comment_by);
  const messageList = array.filter((message) => !message.comment_by);
  
  return messageList.reduce((acc, curr) => {
    acc = [...acc, {...curr, comments: commentList.filter((comment) => comment.comment_by === curr.id)}];
    return acc
  }, []);
}

function testPostApi(request, app, url, data, token) {
  return request(app)
    .post(url)
    .auth(token, { type: 'bearer' })
    .send(data);
}

function testPatchApi(request, app, url, data, token) {
  return request(app)
    .patch(url)
    .auth(token, { type: 'bearer' })
    .send(data);
}

function testGetApi(request, app, url, token) {
  return request(app)
    .get(url)
    .auth(token, { type: 'bearer' });
}

function testDeleteApi(request, app, url, token) {
  return request(app)
    .delete(url)
    .auth(token, { type: 'bearer' });
}
