const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'speada-secret-key-2024'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Seed all branch accounts on startup (password = branch name)
const SEED_BRANCHES = [
  'Dinalupihan', 'Hermosa', 'Orani',
  'Angeles', 'Pandan', 'Dau', 'Mexico', 'Minalin', 'StoTomas',
  'Balanga', 'Samal', 'Orion', 'Guagua', 'Florida', 'Lubao',
  'Malolos1', 'Malolos2', 'Malolos3', 'Mabalacat', 'Capas',
  'Concepcion', 'Magalang', 'Arayat', 'StaAna', 'SF1', 'SF2',
  'Bulaon', 'Baliuge', 'Pulilan', 'Apalit'
];

async function seedBranches() {
  const upsert = db.prepare(
    `INSERT INTO branches (branch_name, password) VALUES (?, ?)
     ON CONFLICT(branch_name) DO UPDATE SET password = excluded.password`
  );

  for (const name of SEED_BRANCHES) {
    const hashedPassword = await bcrypt.hash(name, 10);
    upsert.run(name, hashedPassword);
  }
  console.log(`All ${SEED_BRANCHES.length} branch accounts ready (password = branch name)`);
}

// AUTHENTICATION ENDPOINTS

// Login
app.post('/api/auth/login', async (req, res) => {
  const { branchName, password } = req.body;

  if (!branchName || !password) {
    return res.status(400).json({ error: 'Branch name and password are required' });
  }

  try {
    const branch = db.prepare('SELECT * FROM branches WHERE branch_name = ?').get(branchName);

    if (!branch) {
      return res.status(401).json({ error: 'Invalid branch name or password' });
    }

    const validPassword = await bcrypt.compare(password, branch.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid branch name or password' });
    }

    const token = jwt.sign(
      { id: branch.id, branchName: branch.branch_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      branch: {
        id: branch.id,
        branchName: branch.branch_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// INVENTORY ENDPOINTS

// Get all units for current branch
app.get('/api/inventory', authenticateToken, (req, res) => {
  try {
    const units = db.prepare(
      'SELECT * FROM units WHERE branch_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new unit
app.post('/api/inventory', authenticateToken, (req, res) => {
  const { unitName, color, battery, hasCharger, hasTarpal, problem } = req.body;

  if (!unitName || !color || !battery) {
    return res.status(400).json({ error: 'Unit name, color, and battery are required' });
  }

  try {
    const result = db.prepare(
      `INSERT INTO units (branch_id, unit_name, color, battery, has_charger, has_tarpal, problem)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, unitName, color, battery, hasCharger, hasTarpal, problem || '');

    const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(result.lastInsertRowid);
    res.json({ message: 'Unit added successfully', unit });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Update unit
app.put('/api/inventory/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { unitName, color, battery, hasCharger, hasTarpal, problem } = req.body;

  try {
    const result = db.prepare(
      `UPDATE units
       SET unit_name = ?, color = ?, battery = ?, has_charger = ?, has_tarpal = ?, problem = ?
       WHERE id = ? AND branch_id = ?`
    ).run(unitName, color, battery, hasCharger, hasTarpal, problem || '', id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.json({ message: 'Unit updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete unit
app.delete('/api/inventory/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare(
      'DELETE FROM units WHERE id = ? AND branch_id = ?'
    ).run(id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.json({ message: 'Unit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// SEARCH ENDPOINT - Search across all branches
app.get('/api/search', authenticateToken, (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = db.prepare(
      `SELECT units.*, branches.branch_name
       FROM units
       JOIN branches ON units.branch_id = branches.id
       WHERE units.unit_name LIKE ?
       ORDER BY branches.branch_name, units.created_at DESC`
    ).all(`%${query}%`);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Speada Inventory API running on http://localhost:${PORT}`);
  seedBranches();
});
