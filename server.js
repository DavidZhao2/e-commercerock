const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
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

// session setup
app.use(
  session({
    secret: 'rockbay-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// make user available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// home page
app.get('/', (req, res) => {
  res.render('home', {
    title: 'RockBay – Natural Crystals & Rocks',
  });
});

// optional /home route
app.get('/home', (req, res) => {
  res.render('home', {
    title: 'RockBay – Natural Crystals & Rocks',
  });
});

// shop redirect to home (shop content is on home)
app.get('/shop', (req, res) => {
  res.redirect('/');
});

// product pages

app.get('/products/quartz', (req, res) => {
  res.render('product', {
    title: 'Quartz – RockBay',
    product: {
      name: 'Quartz Point',
      price: 22,
      category: 'healing crystal',
      size: '5–7 cm point',
      description:
        'clear quartz point for clarity, focus, and amplifying intentions.',
      properties: 'clarity • focus • energy amplifier',
    },
  });
});

app.get('/products/jade', (req, res) => {
  res.render('product', {
    title: 'Jade – RockBay',
    product: {
      name: 'Jade Palm Stone',
      price: 30,
      category: 'healing crystal',
      size: '4–5 cm palm stone',
      description:
        'smooth green jade palm stone for balance, luck, and gentle protection.',
      properties: 'luck • balance • emotional calm',
    },
  });
});

app.get('/products/citrine', (req, res) => {
  res.render('product', {
    title: 'Citrine – RockBay',
    product: {
      name: 'Citrine Cluster',
      price: 27,
      category: 'healing crystal',
      size: 'small desk-size cluster',
      description:
        'bright citrine cluster associated with abundance, joy, and confidence.',
      properties: 'abundance • confidence • optimism',
    },
  });
});

app.get('/products/tigereye', (req, res) => {
  res.render('product', {
    title: 'Tiger Eye – RockBay',
    product: {
      name: 'Tiger Eye Tumble Set',
      price: 19,
      category: 'tumbled stones',
      size: 'set of 4–5 tumbles',
      description:
        'grounding tiger eye stones for courage, focus, and protection.',
      properties: 'protection • focus • grounding',
    },
  });
});

// auth pages

app.get('/login', (req, res) => {
  // if already logged in, go to profile
  if (req.session.user) {
    return res.redirect('/profile');
  }

  res.render('login', {
    title: 'Login – RockBay',
  });
});

app.get('/register', (req, res) => {
  // if already logged in, go to profile
  if (req.session.user) {
    return res.redirect('/profile');
  }

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
      error: 'please fill out all fields.',
      name,
      email,
    });
  }

  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.run(sql, [name, email, password], function (err) {
    if (err) {
      let msg = 'something went wrong. please try again.';
      if (err.code === 'SQLITE_CONSTRAINT') {
        msg = 'an account with that email already exists.';
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
      success: 'account created successfully. please log in.',
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
      error: 'please enter both email and password.',
      email,
    });
  }

  const sql = 'SELECT id, name, email, password FROM users WHERE email = ?';
  db.get(sql, [email], (err, user) => {
    if (err) {
      console.error(err);
      return res.render('login', {
        title: 'Login – RockBay',
        error: 'unexpected error. please try again.',
        email,
      });
    }

    if (!user || user.password !== password) {
      return res.render('login', {
        title: 'Login – RockBay',
        error: 'invalid email or password.',
        email,
      });
    }

    // save user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.redirect('/profile');
  });
});

// profile page (requires login)
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('profile', {
    title: 'Profile – RockBay',
    user: req.session.user,
  });
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// category pages
app.get('/crystals', (req, res) => {
  res.render('category', {
    title: 'Crystals – RockBay',
    heading: 'Crystals',
    description: 'healing crystals, points, clusters, and tumbled stones.',
  });
});

app.get('/raw-stones', (req, res) => {
  res.render('category', {
    title: 'Raw Stones – RockBay',
    heading: 'Raw Stones & Chunks',
    description: 'unpolished, natural stone chunks for collectors.',
  });
});

app.get('/minerals', (req, res) => {
  res.render('category', {
    title: 'Minerals – RockBay',
    heading: 'Minerals & Specimens',
    description: 'display specimens and rare mineral formations.',
  });
});

app.get('/fossils', (req, res) => {
  res.render('category', {
    title: 'Fossils – RockBay',
    heading: 'Fossils & Petrified',
    description: 'fossil pieces and petrified wood.',
  });
});

app.get('/bundles', (req, res) => {
  res.render('category', {
    title: 'Bundles – RockBay',
    heading: 'Crystal Bundles',
    description: 'curated bundles for themes like protection or calm.',
  });
});

app.get('/account', (req, res) => {
  // simple redirect to profile for now
  if (req.session.user) {
    return res.redirect('/profile');
  }

  res.redirect('/login');
});

// server start
app.listen(PORT, () => {
  console.log(`RockBay running at http://localhost:${PORT}`);
});
