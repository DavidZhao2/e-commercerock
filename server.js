const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars setup
app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('home', {
    title: 'RockBay – Natural Crystals & Rocks',
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login – RockBay',
  });
});

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

app.listen(PORT, () => {
  console.log(`RockBay running at http://localhost:${PORT}`);
});
