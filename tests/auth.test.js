const request = require('supertest');
const { expect } = require('chai');
const { describe, beforeEach, it } = require('mocha');
const app = require('../app');
const { dbDeleteAll } = require('../db');
const { postApi } = require('../db/handlers');

const table = 'auth';
const user = {
  login: 'alpha',
  password: 'alpha',
};

describe('AUTH', () => {
  beforeEach(async () => {
    await dbDeleteAll(table);
  });

  describe('POST - /auth/signin', () => {
    it('Should create user in database', async () => {
      const res = await postApi(request, app, '/auth/signin', user);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('login', user.login);
    });
  });
  describe('POST - /auth', () => {
    beforeEach(async () => {
      await postApi(request, app, '/auth/signin', user);
    });
    it('Should return token with login and password', async () => {
      const res = await postApi(request, app, '/auth', user);
      expect(res.status).to.equal(200);
      expect(res.headers).to.have.property('authorization');
      expect(res.body).to.have.property('token');
    });
    it("Sholdn't return token", async () => {
      const fakeUser = {
        login: 'alpha',
        password: 'fakepassword',
      };
      const res = await postApi(request, app, '/auth', fakeUser);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'No matched password');
    });
  });
});
