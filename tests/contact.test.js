const request = require('supertest');
const { expect } = require('chai');
const {
  describe, before, beforeEach, it,
} = require('mocha');
const app = require('../app');
const { dbDeleteAll } = require('../db');
const {
  postApi,
  getApi,
  patchApi,
  deleteApi,
} = require('../db/handlers');

const table = 'contacts';
const user = {
  login: 'alpha',
  password: 'alpha',
};

let auth = {};
let userId = null;

const contacts = [
  {
    lastname: 'Григорьев',
    firstname: 'Сергей',
    patronymic: 'Петрович',
    phone: '79162165588',
    email: 'grigoriev@funeral.com',
  },
  {
    lastname: 'Зебзеев',
    firstname: 'Артемий',
    patronymic: 'Николаевич',
    phone: '79082478208',
    email: 'pride.ots@gmail.com',
  },
  {
    lastname: 'Тестов',
    firstname: 'Тест',
    patronymic: 'Тестович',
    phone: '79876543210',
    email: 'test@test.test',
  },
];

describe('CONTACTS', () => {
  before(async () => {
    await dbDeleteAll(table);
  });

  describe('/contacts', () => {
    beforeEach(async () => {
      auth = await postApi(request, app, '/auth', user);
    });
    it('POST | Should create contact in db', async () => {
      const res = await postApi(request, app, `/${table}`, contacts[0], auth.body.token);
      expect(res.status).to.equal(201);
      expect(res.body).have.property('id');
      expect(res.body).have.property('lastname', 'Григорьев');
      expect(res.body).have.property('firstname', 'Сергей');
      expect(res.body).have.property('patronymic', 'Петрович');
      expect(res.body).have.property('phone', '79162165588');
      expect(res.body).have.property('email', 'grigoriev@funeral.com');
    });
    it('GET | Should return array of contacts', async () => {
      await postApi(request, app, `/${table}`, contacts[1], auth.body.token);
      const res = await getApi(request, app, `/${table}`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).instanceOf(Array);
      expect(res.body.length).to.equal(2);
    });
    it('GET :id | Should return contact by id', async () => {
      const postUser = await postApi(request, app, `/${table}`, contacts[2], auth.body.token);
      userId = postUser.body.id;
      const res = await getApi(request, app, `/${table}/${userId}`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).have.property('id', userId);
      expect(res.body).have.property('lastname', 'Тестов');
      expect(res.body).have.property('firstname', 'Тест');
      expect(res.body).have.property('patronymic', 'Тестович');
      expect(res.body).have.property('phone', '79876543210');
      expect(res.body).have.property('email', 'test@test.test');
    });
    it('GET :invalidId | Should return error object', async () => {
      const res = await getApi(request, app, `/${table}/${userId + 10000}`, auth.body.token);
      expect(res.status).to.equal(404);
      expect(res.body).have.property('error');
      expect(res.body.error).have.property('statusCode', 404);
      expect(res.body.error).have.property('message');
    });
    it('PATCH :id | Should update contact by id', async () => {
      const data = {
        email: 'pride.ots@gmail.com',
        phone: '79082478208',
      };
      const res = await patchApi(request, app, `/${table}/${userId}`, data, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).have.property('phone', '79082478208');
      expect(res.body).have.property('email', 'pride.ots@gmail.com');
    });
    it('PATCH :invalidId | Should return error object', async () => {
      const data = {
        email: 'pride.ots@gmail.com',
        phone: '79082478208',
      };
      const res = await patchApi(request, app, `/${table}/${userId + 10000}`, data, auth.body.token);
      expect(res.status).to.equal(404);
      expect(res.body).have.property('error');
      expect(res.body.error).have.property('statusCode', 404);
      expect(res.body.error).have.property('message');
    });
    it('DELETE :id | Should delete contact by id', async () => {
      const res = await deleteApi(request, app, `/${table}/${userId}`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).have.property('deleted', true);
      expect(res.body).have.property('deletedId', userId);
    });
  });
});
