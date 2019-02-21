const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const bcrypt = require('bcrypt');

const { insert, query, select, setAdmin, setAdminFalse } = require('./users');
const { ensureLoggedIn } = require('./utils');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function admin(req, res) {
  const list = await select();

  res.render('admin', { title: 'Notendalisti', list, page: 'admin' });
}

async function adminUser(req, res) {
  //Setjum alla notendur með false
  await setAdminFalse();

  //Setjum þá sem voru valdir sem admin
  const usernames = req.body.admin;
  await setAdmin(usernames);
  
  const list = await select();
  res.render('admin', { title: 'Notendalisti', list, page: 'admin' });
}

router.get('/', ensureLoggedIn, admin);
router.post('/', adminUser);

module.exports = router;
