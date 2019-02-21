require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');

const users = require('./users');
const apply = require('./apply');
const register = require('./register');
const admin = require('./admin');
const applications = require('./applications');

/* todo sækja stillingar úr env */
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  console.error('Add SESSION_SECRET to .env');
  process.exit(1);
}

const app = express();

app.use(express.urlencoded({ extended: true }));

/* todo stilla session og passport */

app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Hjálparfall til að athuga hvort reitur sé gildur eða ekki.
 *
 * @param {string} field Middleware sem grípa á villur fyrir
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
function isInvalid(field, errors) {
  return Boolean(errors.find(i => i.param === field));
}

app.locals.isInvalid = isInvalid;

/* todo setja upp login og logout virkni */

function thanks(req, res) {
  res.redirect('/login');
}

function login(req, res) {
  res.render('login', { title: 'login', username: '', password: '', errors: [] });
}

app.get('/login', login);
app.get('/thanks', thanks);
app.use('/', apply);
app.use('/register', register);
app.use('/applications', applications);
app.use('/admin', admin);

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).render('error', { page: 'error', title: '404', error: '404 fannst ekki' });
}

function errorHandler(error, req, res, next) { // eslint-disable-line
  console.error(error);
  res.status(500).render('error', { page: 'error', title: 'Villa', error });
}

/* Log in */

async function start(username, password, done) {
  try {
    const user = await users.findByUsername(username);
    if (!user) {
      return done(null, false);
    }

    const result = await users.comparePassword(password, user);
    return done(null, result);
  } catch (err) {
    console.log(err);
    return done(null, err);
  }
}

passport.use(new Strategy(start));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

app.get('admin', ensureLoggedIn, (req, res, next) => {
  next();
});

/* Ef notandi er loggaður inn fer hann á næstu, 
annars er hann ennþá í log in */
function ensureLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.send('/applications', applications);
  }
  return res.send('/login');  
});

app.get('/login', (req, res) => {
  /* 
  let message = '';
  
  if (req.session.message && req.session.message.length > 0) {
    message = req.session.message.join(', ');
    req.session.message = [];
  }
  */
  res.send('login', { title: 'innskraning', errors: [] });
});

app.post('/login',
  passport.authenticate('local', {
    failureMessage: 'Notandi eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);

app.get('logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/admin', ensureLoggedIn, (req, res) => {
  app.use('/applications', applications);
});

/* **** */

app.use(notFoundHandler);
app.use(errorHandler);

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
