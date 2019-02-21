const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const bcrypt = require('bcrypt');

const { insert, query, select } = require('./users');
const { ensureLoggedIn } = require('./utils');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}


async function admin(req, res) {
  const list = await select();

  res.render('admin', { title: 'Notendalisti', list, page: 'admin' });
}

router.get('/', ensureLoggedIn, admin);

module.exports = router;
