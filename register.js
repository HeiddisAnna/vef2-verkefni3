const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const { insert, validPassword } = require('./users');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function sanitizeXss(fieldName) {
  return (req, res, next) => {
    if (!req.body) {
      next();
    }

    const field = req.body[fieldName];

    if (field) {
      req.body[fieldName] = xss(field);
    }

    next();
  };
}

const sanitazions = [
  sanitize('name').trim().escape(),
  sanitizeXss('name'),

  sanitizeXss('email'),
  sanitize('email').trim().normalizeEmail(),

  sanitizeXss('username'),
  sanitize('username').trim().escape(),

  sanitizeXss('password1'),
  sanitize('password1').trim().escape(),

  sanitizeXss('password2'),
  sanitize('password2').trim().escape(),
]

const validations = [
  check('name').isLength({ min:1 }).withMessage('Nafn má ekki vera tómt'),
  check('email').isLength({ min:1 }).withMessage('Netfang má ekki vera tómt'),
  check('email').isEmail().withMessage('Netfang verður að vera netfang'),
  check('username').isLength({ min:1 }).withMessage('Notandanafn má ekki vera tómt'),
  check('password1').isLength({ min: 8 }).withMessage('Lykilorð verður að vera minnst 8 stafir'),
  //check('password1').custom((val => {
    //return val1 === val2;
  //}).withMessage('Lykilorðin verða að vera eins'),
]

async function register(req, res) {
  const data = {
    username: '',
    password1: '',
    password2: '',
    name: '',
    email: '',
    admin: false,
    errors: [],
  };
 
  //data.title = 'Nýskráning';

  res.render('register',{ title: 'Nýskráning', data });
}

function showErrors(req, res, next) {
  const {
    body: {
      username = '',
      password1 = '',
      password2 = '',
      name = '',
      email = '',
      admin = false,
    } = {},
  } = req;

  const data = {
    username, 
    password1, 
    name, 
    email,
    admin,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    const title = 'Nýskráning – vandræði';

    return res.render('register', { title, data });
  }

  return next();
}

async function registerPost(req, res) {
  const {
    body: {
      username = '',
      password1 = '',
      password2 = '',
      name = '',
      email = '',
      admin = false,
    } = {},
  } = req;

  const data = {
    username, 
    password1, 
    name, 
    email,
    admin,
  };

  await insert(data);
  return res.render('/thanks');
}

function thanks(req, res) {
  res.render('thanks');
}

router.get('/thanks', thanks);
router.get('/', register);
router.post('/', validations, showErrors, sanitazions, catchErrors(registerPost));

module.exports = router;
