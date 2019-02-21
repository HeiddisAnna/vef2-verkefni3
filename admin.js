const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const bcrypt = require('bcrypt');

const { insert, query } = require('./users');
const { ensureLoggedIn } = require('./utils');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function admin(req, res) {
  res.render('admin', { title: 'Takk' });
}

router.get('/', ensureLoggedIn, admin);

module.exports = router;
