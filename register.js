const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const bcrypt = require('bcrypt');

const { insert, query } = require('./users');

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

function findUserName(user){
  const q = 'SELECT * FROM users WHERE username = $1';
  return query(q, [user]);
}

const sanitazions = [
  sanitize('name').trim().escape(),
  sanitizeXss('name'),

  sanitizeXss('email'),
  sanitize('email').trim().normalizeEmail(),

  sanitizeXss('username'),
  sanitize('username').trim().escape(),
]

const validations = [
  check('name').isLength({ min:1 }).withMessage('Nafn má ekki vera tómt'),
  check('email').isLength({ min:1 }).withMessage('Netfang má ekki vera tómt'),
  check('email').isEmail().withMessage('Netfang verður að vera netfang'),
  check('username').isLength({ min:1 }).withMessage('Notandanafn má ekki vera tómt'),
  check('username').custom(async (val) => {
    const result = await findUserName(val);
    return result.rowCount === 0;
  }).withMessage('Notendanafn er núþegar til'),
  check('password1').isLength({ min: 8 }).withMessage('Lykilorð verður að vera minnst 8 stafir'),
  check('password2').isLength({ min: 8 }).withMessage('Lykilorð verður að vera minnst 8 stafir'),
  check('password1').custom((val, { req }) => val === req.body.password2).withMessage('Lykilorðin verða að vera eins'),
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
  res.render('register', { title: 'Nýskráning', data, page: 'register' });
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
    password2, 
    name, 
    email,
    admin,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    const title = 'Nýskráning – vandræði';

    return res.render('register', { title, data, page:'register' });
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
    name, 
    email,
    admin,
  };
  data.password = password1;

  await insert(data);

  return res.redirect('register/thanks');
}

function thanks(req, res) {
  res.render('thanks', { title: 'Takk', thanksTitle: 'Nýskráning tókst', thanksText: 'Þú getur nú innskráð þig með notandanafni og lykilorði', page:'thanks' });
}

router.get('/', register);
router.get('/thanks', thanks);
router.post('/', validations, showErrors, sanitazions, catchErrors(registerPost));

module.exports = router;
