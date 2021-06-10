const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const logger = require('../services/logger')(module);
const { dbCreateOne, dbGetOneByParam } = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const { user } = req.query;

  if (!user) {
    logger.error('No user passed');
    return res.status(400).json({
      error: 'No user passed',
    });
  }

  const token = jwt.sign(
    { user },
    config.app,
    {
      expiresIn: config.jwt_ttl,
    },
  );

  res.header('Authorization', `Bearer ${token}`);
  return res.status(200).end();
});

router.post('/', async (req, res, next) => {
  const {
    body: {
      login,
      password,
    },
  } = req;
  const hash = await dbGetOneByParam(req, 'login')
    .then((row) => row.hash)
    .catch((err) => next(err));
  const match = await bcrypt.compare(password, hash);
  if (match) {
    const token = jwt.sign(
      { login },
      config.app,
      {
        expiresIn: config.jwt_ttl,
      },
    );
    res.header('Authorization', `Bearer ${token}`);
    return res.status(200).json({ token });
  }

  return res.status(400).json({
    error: 'No matched password',
  });
});

router.post('/signin', async (req, res, next) => {
  const {
    body: {
      login,
      password,
    },
  } = req;
  const salt = await bcrypt.genSalt(config.bcrypt.salt.round);
  const hash = await bcrypt.hash(password, salt);
  const dataToDb = {
    baseUrl: req.baseUrl,
    body: {
      login,
      hash,
    },
  };
  dbCreateOne(dataToDb)
    .then((row) => res.status(201).json(row))
    .catch((err) => next(err));
});

module.exports = router;
