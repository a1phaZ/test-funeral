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
} = require('../db/handlers');

const table = 'companies';
const user = {
  login: 'alpha',
  password: 'alpha',
};
const issueDate = new Date().toISOString();
let companyId = null;

let auth = {};

const companies = [
  {
    contactId: 10,
    name: 'ООО Фирма «Перспективные захоронения»',
    shortName: 'Перспективные захоронения',
    businessEntity: 'ООО',
    contract: {
      no: '12345',
      issue_date: issueDate,
    },
    type: ['agent', 'contractor'],
    status: 'active',
  },
  {
    contactId: 11,
    name: 'ЗАО «Тест тестович»',
    shortName: 'Тест тестович',
    businessEntity: 'ЗАО',
    contract: {
      no: '46538',
      issue_date: issueDate,
    },
    type: ['noagent'],
    status: 'active',
  },
];

describe('COMPANIES', () => {
  before(async () => {
    await dbDeleteAll(table);
  });
  describe('/companies', () => {
    beforeEach(async () => {
      auth = await postApi(request, app, '/auth', user);
    });
    it('POST | Should create company in db', async () => {
      const res = await postApi(request, app, `/${table}`, companies[0], auth.body.token);
      expect(res.status).to.equal(201);
      expect(res.body).have.property('contactId', 10);
      expect(res.body).have.property('name', 'ООО Фирма «Перспективные захоронения»');
      expect(res.body).have.property('shortName', 'Перспективные захоронения');
      expect(res.body).have.property('businessEntity', 'ООО');
      expect(res.body).have.property('contract');
      expect(res.body.contract).have.property('no', '12345');
      expect(res.body.contract).have.property('issue_date', issueDate);
      expect(res.body).have.property('type');
      expect(res.body.type).instanceOf(Array);
      expect(res.body.type.length).to.equal(2);
      expect(res.body).have.property('status', 'active');
    });
    it('GET | Should return list of companies', async () => {
      const postCompany = await postApi(request, app, `/${table}`, companies[1], auth.body.token);
      companyId = postCompany.body.id;
      const res = await getApi(request, app, `/${table}`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).instanceOf(Array);
      expect(res.body.length).to.equal(2);
    });
    it('GET :id | Should return company object by id', async () => {
      const res = await getApi(request, app, `/${table}/${companyId}`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).have.property('contactId', 11);
      expect(res.body).have.property('name', 'ЗАО «Тест тестович»');
      expect(res.body).have.property('shortName', 'Тест тестович');
      expect(res.body).have.property('businessEntity', 'ЗАО');
      expect(res.body).have.property('contract');
      expect(res.body.contract).have.property('no', '46538');
      expect(res.body.contract).have.property('issue_date', issueDate);
      expect(res.body).have.property('type');
      expect(res.body.type).instanceOf(Array);
      expect(res.body.type.length).to.equal(1);
      expect(res.body).have.property('status', 'active');
    });
    it('GET :invalidId | Should return error object', async () => {
      const res = await getApi(request, app, `/${table}/${companyId + 10000}`, auth.body.token);
      expect(res.status).to.equal(404);
      expect(res.body).have.property('error');
      expect(res.body.error).have.property('statusCode', 404);
      expect(res.body.error).have.property('message');
    });
    it('PATCH :id | Should update company in db', async () => {
      const updatedData = {
        status: 'disabled',
        contactId: 12,
      };
      const res = await patchApi(request, app, `/${table}/${companyId}`, updatedData, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).have.property('contactId', 12);
      expect(res.body).have.property('status', 'disabled');
    });
    it('PATCH :invalidId | Should return error object', async () => {
      const updatedData = {
        status: 'disabled',
        contactId: 12,
      };
      const res = await patchApi(request, app, `/${table}/${companyId + 10000}`, updatedData, auth.body.token);
      expect(res.status).to.equal(404);
      expect(res.body).have.property('error');
      expect(res.body.error).have.property('statusCode', 404);
      expect(res.body.error).have.property('message');
    });
    it('GET with filter | Should return filtered list', async () => {
      const res = await getApi(request, app, `/${table}?filter=status&value=active`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).instanceOf(Array);
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).have.property('status', 'active');
    });
    it('GET with sort | Should return sorted list', async () => {
      const res = await getApi(request, app, `/${table}?sort=name&direction=asc`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).instanceOf(Array);
      expect(res.body.length).to.equal(2);
      expect(res.body[0]).have.property('name', 'ЗАО «Тест тестович»');
      expect(res.body[1]).have.property('name', 'ООО Фирма «Перспективные захоронения»');
    });
    it('GET with limit | Should return limited list', async () => {
      const res = await getApi(request, app, `/${table}?limit=1&page=2`, auth.body.token);
      expect(res.status).to.equal(200);
      expect(res.body).instanceOf(Array);
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).have.property('name', 'ЗАО «Тест тестович»');
    });
  });
});
