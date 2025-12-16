const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const db = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------------- HANDLEBARS SETUP ---------------------- */

app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    helpers: {
      // simple math helper (used in checkout, etc.)
      multiply: (a, b) => (Number(a) || 0) * (Number(b) || 0),

      // equality helper for nav highlighting etc.
      eq: (a, b) => a === b,
    },
  })
);

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

/* ---------------------- MIDDLEWARE ---------------------- */

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'rockbay-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// make user, cart count, and current path available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;

  // ensure cart is always an object
  if (!req.session.cart || typeof req.session.cart !== 'object' || Array.isArray(req.session.cart)) {
    req.session.cart = {};
  }

  const cartCount = Object.values(req.session.cart).reduce(
    (sum, qty) => sum + (Number(qty) || 0),
    0
  );
  res.locals.cartCount = cartCount;

  next();
});

/* ---------------------- PRODUCT CATALOG ---------------------- */

const products = {
  // --- crystals (home/featured) ---
  quartz: {
    slug: 'quartz',
    title: 'Quartz – RockBay',
    name: 'Quartz Point',
    price: 22,
    category: 'Healing Crystal',
    type: 'crystals',
    size: '5–7 cm point',
    description:
      'Clear quartz point for clarity, focus, and amplifying intentions.',
    properties: 'Clarity • Focus • Energy Amplifier',
  },
  jade: {
    slug: 'jade',
    title: 'Jade – RockBay',
    name: 'Jade Palm Stone',
    price: 30,
    category: 'Healing Crystal',
    type: 'crystals',
    size: '4–5 cm palm stone',
    description:
      'Smooth green jade palm stone for balance, luck, and gentle protection.',
    properties: 'Luck • Balance • Emotional Calm',
  },
  citrine: {
    slug: 'citrine',
    title: 'Citrine – RockBay',
    name: 'Citrine Cluster',
    price: 27,
    category: 'Healing Crystal',
    type: 'crystals',
    size: 'Small desk-size cluster',
    description:
      'Bright citrine cluster associated with abundance, joy, and confidence.',
    properties: 'Abundance • Confidence • Optimism',
  },
  tigereye: {
    slug: 'tigereye',
    title: 'Tiger Eye – RockBay',
    name: 'Tiger Eye Tumble Set',
    price: 19,
    category: 'Tumbled Stones',
    type: 'crystals',
    size: 'Set of 4–5 tumbles',
    description:
      'Grounding tiger eye stones for courage, focus, and protection.',
    properties: 'Protection • Focus • Grounding',
  },
  amethyst: {
    slug: 'amethyst',
    title: 'Amethyst – RockBay',
    name: 'Amethyst Cluster',
    price: 25,
    category: 'Crystals',
    type: 'crystals',
    size: 'Medium cluster',
    description:
      'Deep violet amethyst cluster ideal for meditation, calm, and protection. Each piece is hand-selected.',
    properties: 'Calm • Protection • Intuition',
  },
  'rose-quartz-heart': {
    slug: 'rose-quartz-heart',
    title: 'Rose Quartz – RockBay',
    name: 'Rose Quartz Heart',
    price: 24,
    category: 'Crystals',
    type: 'crystals',
    size: 'Polished heart',
    description:
      'Soft pink rose quartz heart that supports self-love, compassion, and emotional healing.',
    properties: 'Self-Love • Compassion • Emotional Healing',
  },

  // --- minerals ---
  'black-obsidian-tumble': {
    slug: 'black-obsidian-tumble',
    title: 'Black Obsidian – RockBay',
    name: 'Black Obsidian Tumble',
    price: 18,
    category: 'Crystals',
    type: 'minerals',
    size: 'Set of small tumbles',
    description:
      'Tumbled black obsidian stones that help with grounding, protection, and clearing negative energy.',
    properties: 'Protection • Grounding • Energy Clearing',
  },
  'selenite-wand': {
    slug: 'selenite-wand',
    title: 'Selenite – RockBay',
    name: 'Selenite Wand',
    price: 16,
    category: 'Crystals',
    type: 'minerals',
    size: 'Smooth wand',
    description:
      'Smooth selenite wand used to cleanse energy, charge other crystals, and clear auras.',
    properties: 'Cleansing • Charging • Aura Clearing',
  },
  'fluorite-tower': {
    slug: 'fluorite-tower',
    title: 'Fluorite Tower – RockBay',
    name: 'Fluorite Tower',
    price: 32,
    category: 'Mineral',
    type: 'minerals',
    size: '8–10 cm standing tower',
    description:
      'Banding of purple and green fluorite carved into a standing tower for desks or altars.',
    properties: 'Focus • Clarity • Mental balance',
  },
  'labradorite-palm': {
    slug: 'labradorite-palm',
    title: 'Labradorite Palm Stone – RockBay',
    name: 'Labradorite Palm Stone',
    price: 29,
    category: 'Mineral',
    type: 'minerals',
    size: '4–5 cm palm stone',
    description:
      'Shimmering labradorite palm stone with blue and gold flash when turned in the light.',
    properties: 'Protection • Intuition • Magic',
  },
  'pyrite-cube': {
    slug: 'pyrite-cube',
    title: 'Pyrite Cube – RockBay',
    name: 'Pyrite Cube',
    price: 26,
    category: 'Mineral',
    type: 'minerals',
    size: 'Natural cubic formation',
    description:
      'Metallic pyrite cube specimen, sometimes called “fool’s gold,” perfect for shelves or grids.',
    properties: 'Confidence • Willpower • Abundance',
  },
  'hematite-tumble-set': {
    slug: 'hematite-tumble-set',
    title: 'Hematite Tumble Set – RockBay',
    name: 'Hematite Tumble Set',
    price: 18,
    category: 'Mineral',
    type: 'minerals',
    size: 'Set of 4–5 tumbles',
    description:
      'Smooth, weighty hematite tumbles that are great for grounding and stress relief.',
    properties: 'Grounding • Protection • Stability',
  },
  'malachite-slice': {
    slug: 'malachite-slice',
    title: 'Malachite Slice – RockBay',
    name: 'Malachite Slice',
    price: 41,
    category: 'Mineral',
    type: 'minerals',
    size: 'Polished slice or freeform',
    description:
      'Rich green malachite slice showing natural banding and rings, ideal for display.',
    properties: 'Transformation • Protection • Heart energy',
  },
  'smoky-quartz-point': {
    slug: 'smoky-quartz-point',
    title: 'Smoky Quartz Point – RockBay',
    name: 'Smoky Quartz Point',
    price: 28,
    category: 'Mineral',
    type: 'minerals',
    size: '6–8 cm point',
    description:
      'Smoky quartz point with gentle brown tones, often used for grounding and protection.',
    properties: 'Grounding • Protection • Energy filter',
  },

  // --- fossils ---
  'ammonite-slice': {
    slug: 'ammonite-slice',
    title: 'Ammonite Slice – RockBay',
    name: 'Ammonite Slice',
    price: 38,
    category: 'Fossil',
    type: 'fossils',
    size: '6–8 cm polished slice',
    description:
      'Polished ammonite slice showing beautiful spiral chambers and natural mineral patterns.',
    properties: 'Ancient energy • Transformation • Earth history',
  },
  'trilobite-plate': {
    slug: 'trilobite-plate',
    title: 'Trilobite Plate – RockBay',
    name: 'Trilobite Plate',
    price: 45,
    category: 'Fossil',
    type: 'fossils',
    size: 'Small matrix plate',
    description:
      'Fossilized trilobite preserved in stone matrix, perfect for desks or shelves.',
    properties: 'Ancient oceans • Evolution • Study piece',
  },
  'orthoceras-tower': {
    slug: 'orthoceras-tower',
    title: 'Orthoceras Tower – RockBay',
    name: 'Orthoceras Tower',
    price: 34,
    category: 'Fossil',
    type: 'fossils',
    size: '10–14 cm carved tower',
    description:
      'Standing tower carved from orthoceras fossil, showing multiple shell imprints.',
    properties: 'Grounding • Focus • Ancient sea life',
  },
  'megalodon-tooth': {
    slug: 'megalodon-tooth',
    title: 'Megalodon Tooth – RockBay',
    name: 'Megalodon Tooth',
    price: 89,
    category: 'Fossil',
    type: 'fossils',
    size: 'Replica display tooth',
    description:
      'Large megalodon tooth replica with detailed serrations, ready to display.',
    properties: 'Strength • Power • Ocean legend',
  },
  'petrified-wood-slab': {
    slug: 'petrified-wood-slab',
    title: 'Petrified Wood Slab – RockBay',
    name: 'Petrified Wood Slab',
    price: 52,
    category: 'Fossil',
    type: 'fossils',
    size: 'Flat polished slice',
    description:
      'Polished slice of petrified wood showing rings and mineral colors.',
    properties: 'Stability • Patience • Earth connection',
  },

  // --- raw stones ---
  'raw-quartz-cluster': {
    slug: 'raw-quartz-cluster',
    title: 'Raw Quartz Cluster – RockBay',
    name: 'Raw Quartz Cluster',
    price: 24,
    category: 'Raw Stone',
    type: 'raw-stones',
    size: 'Hand-sized cluster',
    description:
      'Natural clear quartz cluster with multiple points growing from a shared base.',
    properties: 'Clarity • Amplification • Energy focus',
  },
  'raw-rose-quartz-chunk': {
    slug: 'raw-rose-quartz-chunk',
    title: 'Raw Rose Quartz Chunk – RockBay',
    name: 'Raw Rose Quartz Chunk',
    price: 20,
    category: 'Raw Stone',
    type: 'raw-stones',
    size: 'Medium rough piece',
    description:
      'Unpolished rose quartz with soft pink tones, perfect for bowls or altar corners.',
    properties: 'Self-love • Compassion • Gentle heart energy',
  },
  'raw-black-tourmaline': {
    slug: 'raw-black-tourmaline',
    title: 'Raw Black Tourmaline – RockBay',
    name: 'Raw Black Tourmaline',
    price: 22,
    category: 'Raw Stone',
    type: 'raw-stones',
    size: 'Chunky rod formation',
    description:
      'Rough black tourmaline rod with natural striations, often used for protection and grounding.',
    properties: 'Protection • Grounding • Energy shield',
  },
  'raw-calcite-honey': {
    slug: 'raw-calcite-honey',
    title: 'Raw Honey Calcite – RockBay',
    name: 'Raw Honey Calcite',
    price: 19,
    category: 'Raw Stone',
    type: 'raw-stones',
    size: 'Small to medium pieces',
    description:
      'Translucent honey calcite chunks with warm golden tones and natural faces.',
    properties: 'Confidence • Motivation • Solar energy',
  },
  'raw-amazonite-piece': {
    slug: 'raw-amazonite-piece',
    title: 'Raw Amazonite – RockBay',
    name: 'Raw Amazonite Piece',
    price: 21,
    category: 'Raw Stone',
    type: 'raw-stones',
    size: 'Palm-sized rough piece',
    description:
      'Blue-green amazonite in raw form, showing natural color and matrix.',
    properties: 'Calm communication • Balance • Soothing energy',
  },

  // --- bundles ---
  'winter-calm-bundle': {
    slug: 'winter-calm-bundle',
    title: 'Winter Calm Bundle – RockBay',
    name: 'Winter Calm Crystal Bundle',
    price: 54,
    category: 'Crystal Bundle',
    type: 'bundles',
    size: 'Set of 4–5 stones',
    description:
      'A cozy winter set with amethyst, rose quartz, and selenite picks for calm nights and stress relief.',
    properties: 'Calm • Stress relief • Soft heart energy',
  },
  'protection-starter-set': {
    slug: 'protection-starter-set',
    title: 'Protection Starter Set – RockBay',
    name: 'Protection Starter Set',
    price: 49,
    category: 'Crystal Bundle',
    type: 'bundles',
    size: 'Small kit in pouch',
    description:
      'Beginner-friendly kit with black tourmaline, obsidian, and selenite pieces for daily protection.',
    properties: 'Protection • Grounding • Energy shield',
  },
  'abundance-desk-bundle': {
    slug: 'abundance-desk-bundle',
    title: 'Abundance Desk Bundle – RockBay',
    name: 'Abundance Desk Bundle',
    price: 59,
    category: 'Crystal Bundle',
    type: 'bundles',
    size: 'Desk-size trio',
    description:
      'Citrine, pyrite, and green aventurine style bundle designed to sit on your desk for focus and abundance.',
    properties: 'Abundance • Confidence • Work focus',
  },
  'fossil-discovery-pack': {
    slug: 'fossil-discovery-pack',
    title: 'Fossil Discovery Pack – RockBay',
    name: 'Fossil Discovery Pack',
    price: 62,
    category: 'Fossil Bundle',
    type: 'bundles',
    size: 'Mixed small fossils',
    description:
      'Mixed pack of small ammonite, orthoceras, and trilobite pieces, great for gifts or classrooms.',
    properties: 'Earth history • Curiosity • Learning',
  },
};

/* ---------------------- CART HELPERS ---------------------- */

// make sure cart is an object { slug: quantity }
function getCartObject(req) {
  if (!req.session.cart || typeof req.session.cart !== 'object' || Array.isArray(req.session.cart)) {
    req.session.cart = {};
  }
  return req.session.cart;
}

// turn { slug: qty } into array of items
function buildCartItems(cartObj) {
  return Object.entries(cartObj)
    .map(([slug, qty]) => {
      const product = products[slug];
      if (!product) return null;

      const quantity = Number(qty) || 0;
      const lineTotal = product.price * quantity;

      return {
        slug,
        name: product.name,
        price: product.price,
        quantity,
        lineTotal,
      };
    })
    .filter(Boolean);
}

function getCartTotals(cartObj) {
  const items = buildCartItems(cartObj);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
}

/* ---------------------- DB HELPERS (SAVE CART) ---------------------- */

function saveCartForUser(userId, cartObj) {
  if (!userId) return;
  const cartJson = JSON.stringify(cartObj || {});

  db.get('SELECT id FROM carts WHERE user_id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Failed to check cart row for user', userId, err);
      return;
    }

    if (row) {
      db.run(
        'UPDATE carts SET cart_json = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [cartJson, userId],
        (err2) => {
          if (err2) {
            console.error('Failed to update cart for user', userId, err2);
          }
        }
      );
    } else {
      db.run(
        'INSERT INTO carts (user_id, cart_json) VALUES (?, ?)',
        [userId, cartJson],
        (err2) => {
          if (err2) {
            console.error('Failed to insert cart for user', userId, err2);
          }
        }
      );
    }
  });
}

function getProductsByType(type) {
  return Object.values(products).filter((p) => p.type === type);
}

/* ---------------------- HOME & BASIC ROUTES ---------------------- */

app.get('/', (req, res) => {
  res.render('home', {
    title: 'RockBay – Natural Crystals & Rocks',
  });
});

app.get('/home', (req, res) => {
  res.redirect('/');
});

// shop is handled by home page now
app.get('/shop', (req, res) => {
  res.redirect('/');
});

// info pages
app.get('/about-rocks', (req, res) => {
  res.render('about-rocks', {
    title: 'About Rocks – RockBay',
  });
});

app.get('/shipping', (req, res) => {
  res.render('shipping', {
    title: 'Shipping – RockBay',
  });
});

app.get('/crystal-guide', (req, res) => {
  res.render('crystal-guide', {
    title: 'Crystal Guide – RockBay',
  });
});

app.get('/faq', (req, res) => {
  res.render('faq', {
    title: 'FAQ – RockBay',
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact – RockBay',
  });
});

app.get('/social-media', (req, res) => {
  res.render('social-media', {
    title: 'Social Media – RockBay',
  });
});


/* ---------------------- PRODUCT & CATEGORY ROUTES ---------------------- */

// product detail
app.get('/products/:slug', (req, res) => {
  const slug = req.params.slug;
  const product = products[slug];

  if (!product) {
    return res.status(404).render('category', {
      title: 'Product Not Found – RockBay',
      heading: 'Product Not Found',
      description: 'This crystal is not available or may have been removed.',
    });
  }

  res.render('product', {
    title: product.title,
    product,
  });
});

// category pages
app.get('/crystals', (req, res) => {
  res.render('category', {
    title: 'Crystals – RockBay',
    heading: 'Crystals',
    description: 'Healing crystals, points, clusters, and tumbled stones.',
    products: getProductsByType('crystals'),
  });
});

app.get('/raw-stones', (req, res) => {
  res.render('category', {
    title: 'Raw Stones – RockBay',
    heading: 'Raw Stones',
    description: 'Unpolished, natural stone chunks and raw pieces.',
    products: getProductsByType('raw-stones'),
  });
});

app.get('/minerals', (req, res) => {
  res.render('category', {
    title: 'Minerals – RockBay',
    heading: 'Minerals & Specimens',
    description: 'Display pieces, mineral specimens, and unique finds.',
    products: getProductsByType('minerals'),
  });
});

app.get('/fossils', (req, res) => {
  res.render('category', {
    title: 'Fossils – RockBay',
    heading: 'Fossils',
    description: 'Ancient fossils and petrified wood.',
    products: getProductsByType('fossils'),
  });
});

app.get('/bundles', (req, res) => {
  res.render('category', {
    title: 'Bundles – RockBay',
    heading: 'Crystal Bundles',
    description:
      'Curated bundles for calm, protection, abundance, and fossil lovers.',
    products: getProductsByType('bundles'),
  });
});

function buildCartSnapshot(req) {
  const cart = req.session.cart || {}; // { slug: quantity }

  const items = Object.entries(cart)
    .map(([slug, qty]) => {
      const product = products[slug];
      if (!product) return null;

      const quantity = Number(qty) || 0;
      const lineTotal = quantity * product.price;

      return {
        slug,
        name: product.name,
        price: product.price,
        quantity,
        lineTotal,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
}

/* ---------------------- CART ROUTES ---------------------- */

// add to cart
app.post('/cart/add', (req, res) => {
  const { slug, quantity } = req.body;
  const product = products[slug];

  if (!product) {
    return res.status(400).send('Invalid product');
  }

  const qty = parseInt(quantity || '1', 10);
  if (Number.isNaN(qty) || qty <= 0) {
    return res.redirect(`/products/${slug}`);
  }

  const cart = getCartObject(req);

  if (!cart[slug]) {
    cart[slug] = 0;
  }
  cart[slug] += qty;

  if (req.session.user && req.session.user.id) {
    saveCartForUser(req.session.user.id, cart);
  }

  res.redirect('/cart');
});

// view cart
app.get('/cart', (req, res) => {
  const { items, subtotal, itemCount } = buildCartSnapshot(req);

  res.render('cart', {
    title: 'Shopping Cart – RockBay',
    items,
    subtotal,
    itemCount,
  });
});

// remove from cart
app.post('/cart/remove', (req, res) => {
  const { slug } = req.body;
  const cart = getCartObject(req);

  if (cart[slug]) {
    delete cart[slug];
  }

  if (req.session.user && req.session.user.id) {
    saveCartForUser(req.session.user.id, cart);
  }

  res.redirect('/cart');
});

/* ---------------------- CHECKOUT ROUTES ---------------------- */

// checkout page
app.get('/checkout', (req, res) => {
  const { items, subtotal, itemCount } = buildCartSnapshot(req);

  if (!itemCount) {
    return res.redirect('/cart');
  }

  res.render('checkout', {
    title: 'Checkout – RockBay',
    items,
    subtotal,
    itemCount,
    user: req.session.user || null,
  });
});

// checkout submit
app.post('/checkout', (req, res) => {
  const { items, subtotal, itemCount } = buildCartSnapshot(req);

  if (!itemCount) {
    return res.redirect('/cart');
  }

  const { fullName, email, address, city, postalCode } = req.body;
  const errors = [];

  if (!fullName) errors.push('Full name is required.');
  if (!email) errors.push('Email is required.');
  if (!address) errors.push('Address is required.');
  if (!city) errors.push('City is required.');
  if (!postalCode) errors.push('Postal/ZIP code is required.');

  if (errors.length) {
    return res.render('checkout', {
      title: 'Checkout – RockBay',
      items,
      subtotal,
      itemCount,
      user: req.session.user || null,
      errors,
      form: { fullName, email, address, city, postalCode },
    });
  }

  const userId = req.session.user ? req.session.user.id : null;

  // Insert into orders; SQLite will auto-increment the id
  db.run(
    'INSERT INTO orders (user_id, subtotal) VALUES (?, ?)',
    [userId, subtotal],
    function (err) {
      if (err) {
        console.error('Failed to create order:', err);
        return res.render('checkout', {
          title: 'Checkout – RockBay',
          items,
          subtotal,
          itemCount,
          user: req.session.user || null,
          errors: ['Something went wrong placing your order. Please try again.'],
          form: { fullName, email, address, city, postalCode },
        });
      }

      // This is your incrementing order number
      const orderNumber = this.lastID;

      // Clear the cart after "order"
      req.session.cart = {};
      res.locals.cartCount = 0;

      res.render('checkout-success', {
        title: 'Order placed – RockBay',
        orderNumber,
        subtotal,
      });
    }
  );
});

/* ---------------------- AUTH ROUTES ---------------------- */

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }

  res.render('login', {
    title: 'Login – RockBay',
  });
});

app.get('/register', (req, res) => {
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

    // load saved cart from carts table
    db.get(
      'SELECT cart_json FROM carts WHERE user_id = ?',
      [user.id],
      (err2, row) => {
        let savedCart = {};
        if (err2) {
          console.error('Failed to load saved cart for user', user.id, err2);
        } else if (row && row.cart_json) {
          try {
            savedCart = JSON.parse(row.cart_json);
          } catch (e) {
            console.error('Failed to parse saved cart JSON for user', user.id, e);
          }
        }

        const guestCart = getCartObject(req);
        // saved cart overrides guest cart on conflicts
        const mergedCart = { ...guestCart, ...savedCart };
        req.session.cart = mergedCart;

        res.redirect('/profile');
      }
    );
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

app.get('/account', (req, res) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  res.redirect('/login');
});

/* ---------------------- START SERVER ---------------------- */
app.listen(PORT, () => {
  console.log(`RockBay running at http://localhost:${PORT}`);
});
