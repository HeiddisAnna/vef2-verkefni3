const express = require('express');

const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const applications = require('./applications');

const users = require('./users');

const app = express.Router();

app.use(express.urlencoded({ extended: true }));

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
    return res.render('/applications', applications);
  }
  return res.redirect('/login');
});

app.get('/login', (req, res) => {
  let message = '';

  if (req.session.message && req.session.message.length > 0) {
    message = req.session.message.join(', ');
    req.session.message = [];
  }

  res.render('login', message);
});

app.post('/login',
  passport.authenticate('local', {
    failureMessage: 'Notandi eða lykilorð vitlaust.', 
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/applications');
  },
);

app.get('logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/applicatons', ensureLoggedIn, (req, res) => {
  res.render('/applications', applications);
});
