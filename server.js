const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const db = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

// handlebars setup
app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// form body parser
app.use(express.urlencoded({ extended: true }));

// home page
app.get('/', (req, res) => {
  res.render('home', {
    title: 'RockBay – Natural Crystals & Rocks',
  });
});

app.get('/home', (req, res) => {
  res.render('home', {
    title: 'RockBay – Natural Crystals & Rocks',
  });
});


// auth pages
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login – RockBay',
  });
});

app.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register – RockBay',
  });
});

// register submit
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('register', {
      title: 'Register – RockBay',
      error: 'Please fill out all fields.',
      name,
      email,
    });
  }

  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.run(sql, [name, email, password], function (err) {
    if (err) {
      let msg = 'Something went wrong. Please try again.';
      if (err.code === 'SQLITE_CONSTRAINT') {
        msg = 'An account with that email already exists.';
      }

      return res.render('register', {
        title: 'Register – RockBay',
        error: msg,
        name,
        email,
      });
    }

    res.render('login', {
      title: 'Login – RockBay',
      success: 'Account created successfully. Please log in.',
      email,
    });
  });
});

// login submit
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', {
      title: 'Login – RockBay',
      error: 'Please enter both email and password.',
      email,
    });
  }

  const sql = 'SELECT id, name, email, password FROM users WHERE email = ?';
  db.get(sql, [email], (err, user) => {
    if (err) {
      console.error(err);
      return res.render('login', {
        title: 'Login – RockBay',
        error: 'Unexpected error. Please try again.',
        email,
      });
    }

    if (!user || user.password !== password) {
      return res.render('login', {
        title: 'Login – RockBay',
        error: 'Invalid email or password.',
        email,
      });
    }

    res.render('profile', {
      title: 'Profile – RockBay',
      user,
    });
  });
});

// category pages
app.get('/crystals', (req, res) => {
  res.render('category', {
    title: 'Crystals – RockBay',
    heading: 'Crystals',
    description: 'Healing crystals, points, clusters, and tumbled stones.',
  });
});

app.get('/raw-stones', (req, res) => {
  res.render('category', {
    title: 'Raw Stones – RockBay',
    heading: 'Raw Stones & Chunks',
    description: 'Unpolished, natural stone chunks for collectors.',
  });
});

app.get('/minerals', (req, res) => {
  res.render('category', {
    title: 'Minerals – RockBay',
    heading: 'Minerals & Specimens',
    description: 'Display specimens and rare mineral formations.',
  });
});

app.get('/fossils', (req, res) => {
  res.render('category', {
    title: 'Fossils – RockBay',
    heading: 'Fossils & Petrified',
    description: 'Fossil pieces and petrified wood.',
  });
});

app.get('/bundles', (req, res) => {
  res.render('category', {
    title: 'Bundles – RockBay',
    heading: 'Crystal Bundles',
    description: 'Curated bundles for themes like protection or calm.',
  });
});

app.get('/account', (req, res) => {
  res.render('category', {
    title: 'Account – RockBay',
    heading: 'Account',
    description: 'Login, order history, and saved wish lists will go here.',
  });
});

// server start
app.listen(PORT, () => {
  console.log(`RockBay running at http://localhost:${PORT}`);
});
