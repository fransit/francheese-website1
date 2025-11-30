const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');
// const sgMail = require('@sendgrid/mail'); // Commented out - not installed
// const nodemailer = require('nodemailer'); // Commented out - not installed
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// Simple rate limiting (in production, use a proper rate limiter)
const requestCounts = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);
  requestCounts.set(ip, validRequests);

  if (validRequests.length >= maxRequests) {
    return res.status(429).json({ message: 'Too many requests, please try again later' });
  }

  validRequests.push(now);
  next();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit); // Apply rate limiting to all routes

// In-memory data storage (for development/testing)
let users = [];
let products = [];
let orders = [];

// Initialize sample data
const initializeData = () => {
  // Create admin user
  const adminUser = {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@francheese.com',
    password: '$2a$10$IHVc02MsEnnbRQGyaZUtw.0hnAJr3mlGiCE2UlFYP3tJ3n2PVcoAS', // admin123
    isAdmin: true,
    purchases: [],
    points: 0,
    totalSpent: 0,
    verified: true
  };
  users.push(adminUser);

  // Start with empty products array - user will add their own products
  products = [];

  console.log('Sample data initialized');
};

initializeData();

// Removed MongoDB schemas - using in-memory data structures instead

// Serve the main HTML file for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'francheese.html'));
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const jwtSecret = process.env.JWT_SECRET || 'francheese-super-secret-key-2024';
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Routes

// Register (Simplified - No Email Verification)
app.post('/api/auth/register', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: email === 'admin@test.com', // Make admin@test.com an admin for testing
      purchases: [],
      points: 0,
      totalSpent: 0,
      verified: true // Auto-verified for simplicity
    };

    users.push(user);

    res.status(201).json({
      message: 'Account created successfully! You can now login.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        points: user.points,
        totalSpent: user.totalSpent,
        verified: user.verified
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'francheese-super-secret-key-2024';
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        points: user.points,
        totalSpent: user.totalSpent,
        verified: user.verified
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userOrders = orders.filter(o => o.user === req.user.id);
    // Extract unique product IDs from all orders
    const purchasedProductIds = [...new Set(
      userOrders.flatMap(order => order.items.map(item => item.product))
    )];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      purchases: purchasedProductIds,
      points: user.points,
      totalSpent: user.totalSpent,
      verified: user.verified
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products
app.get('/api/products', async (req, res) => {
  try {
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
app.post('/api/products', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

  const {
    name,
    description,
    price,
    image,
    category,
    stock,
    videoUrl,
    fileUrl,
    features,
    pointsCost,
    version
  } = req.body;

  try {
    const product = {
      id: `prod-${Date.now()}`,
      name,
      description,
      price,
      image,
      category,
      stock,
      featured: false,
      videoUrl: videoUrl || '',
      fileUrl: fileUrl || '',
      features: features || [],
      pointsCost: pointsCost || 0,
      version: version || '1.0.0',
      sold: 0
    };

    products.push(product);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      image,
      category,
      stock,
      videoUrl,
      fileUrl,
      features,
      pointsCost,
      version,
      sold
    } = req.body;

    // Update product properties
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (videoUrl !== undefined) product.videoUrl = videoUrl;
    if (fileUrl !== undefined) product.fileUrl = fileUrl;
    if (features !== undefined) product.features = features;
    if (pointsCost !== undefined) product.pointsCost = pointsCost;
    if (version !== undefined) product.version = version;
    if (sold !== undefined) product.sold = sold;

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

  try {
    const userList = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      purchases: u.purchases || [],
      points: u.points || 0,
      totalSpent: u.totalSpent || 0,
      verified: u.verified,
      createdAt: u.createdAt
    }));
    res.json(userList);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

  try {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, isAdmin, points, totalSpent } = req.body;

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (points !== undefined) user.points = points;
    if (totalSpent !== undefined) user.totalSpent = totalSpent;

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, total } = req.body;

  try {
    const order = {
      id: `order-${Date.now()}`,
      user: req.user.id,
      items,
      total,
      status: 'pending',
      createdAt: new Date()
    };

    orders.push(order);

    // Update user purchases
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.purchases.push(order.id);
      user.totalSpent += total;
      user.points += Math.floor(total / 10); // 1 point per $10 spent
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('API endpoints available at http://localhost:' + PORT + '/api');
});
