const xss = require('xss');
const express = require('express');

const { query } = require('./users');

const router = express.Router();

async function getUser(user) {
  const q = 'SELECT * FROM users WHERE username = $1';
  const result = await query(q, [user]);
  return result.rows;
}

async function validateLogin(req, res) {
  const result = await getUser(req.body.username);

  if(result.length === 0) {
    const errors = ['Notandi eða lykilorð er ekki rétt'];
    res.render('login', { title: 'login', username: req.body.username, password: req.body.password, errors });
  } else {
    if (result[0].password === req.body.password) {  // eslint-disable-line
      res.redirect('/applications');
    } else {
      const errors = ['Notandi eða lykilorð er ekki rétt'];
      res.render('login', {title: 'login', username: req.body.username, password: req.body.password, errors });
    }
  }  
}

router.post('/', validateLogin);
module.exports = router;