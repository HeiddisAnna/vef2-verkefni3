// const xss = require('xss');
const express = require('express');
// const { check, validationResult } = require('express-validator/check');
// const { sanitize } = require('express-validator/filter');

const { insert } = require('./db');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function register(req, res) {
  const data = {
    username: '',
    password: '',
    name: '',
    email: '',
    admin: '',
    errors: [],
  };
 
  res.render('register', { title: 'Nýskráning', data });
}

async function registerPost(req, res) {
  const {
    body: {
      username = '',
      password = '',
      name = '',
      email = '',
      admin = '',
    } = {},
  } = req;

  const data = {
    username, 
    password, 
    name, 
    email,
    admin,
  };

  await insert(data);
  return res.redirect('/thanks');
}

function thanks(req, res) {
  res.render('thanks');
}

//router.get('/thanks', thanks);
router.get('/', register);
//router.post('/sucess', catchErrors(registerPost));

module.exports = router;
