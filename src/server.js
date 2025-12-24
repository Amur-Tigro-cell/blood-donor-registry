const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Simple admin credentials (You can change these)
const ADMIN_USERNAME = 'subro';
const ADMIN_PASSWORD = 'subro2025';
const ADMIN_SESSION = {}; // Store active sessions

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database setup
const db = new sqlite3.Database('./donors.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

// Create tables if they don't exist
db.run(`
  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    level TEXT NOT NULL,
    term TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    donation_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(donor_id) REFERENCES donors(id) ON DELETE CASCADE
  )
`);

// Routes

// Register a new donor
app.post('/api/donors', (req, res) => {
  const { student_id, name, blood_group, address, phone_number, level, term } = req.body;

  if (!student_id || !name || !blood_group || !address || !phone_number || !level || !term) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    `INSERT INTO donors (student_id, name, blood_group, address, phone_number, level, term)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [student_id, name, blood_group, address, phone_number, level, term],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Student ID already registered' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        student_id,
        name,
        blood_group,
        address,
        phone_number,
        level,
        term,
      });
    }
  );
});

// Search donors by blood group
app.get('/api/donors/search/:bloodGroup', (req, res) => {
  const { bloodGroup } = req.params;

  db.all(
    `SELECT id, student_id, name, blood_group, address, phone_number, level, term
     FROM donors WHERE blood_group = ? ORDER BY name`,
    [bloodGroup],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Get all donors
app.get('/api/donors', (req, res) => {
  db.all(
    `SELECT id, student_id, name, blood_group, address, phone_number, level, term
     FROM donors ORDER BY name`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Get donor by ID
app.get('/api/donors/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM donors WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Donor not found' });
      }
      res.json(row);
    }
  );
});

// Update donor
app.put('/api/donors/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, phone_number, level, term } = req.body;

  if (!name || !address || !phone_number || !level || !term) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    `UPDATE donors SET name = ?, address = ?, phone_number = ?, level = ?, term = ? WHERE id = ?`,
    [name, address, phone_number, level, term, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Donor not found' });
      }
      res.json({ message: 'Donor updated successfully' });
    }
  );
});

// Delete donor
app.delete('/api/donors/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM donors WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    res.json({ message: 'Donor deleted successfully' });
  });
});

// AUTHENTICATION MIDDLEWARE
function verifyAdminToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token || !ADMIN_SESSION[token]) {
    return res.status(401).json({ error: 'Unauthorized: Admin login required' });
  }
  
  next();
}

// ADMIN ENDPOINTS

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = 'admin_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    ADMIN_SESSION[token] = {
      username: username,
      loginTime: new Date(),
    };
    
    return res.status(200).json({
      success: true,
      token: token,
      message: 'Login successful',
    });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.headers['authorization'];
  
  if (token && ADMIN_SESSION[token]) {
    delete ADMIN_SESSION[token];
  }
  
  res.json({ success: true, message: 'Logout successful' });
});

// Verify admin session
app.get('/api/admin/verify', (req, res) => {
  const token = req.headers['authorization'];
  
  if (!token || !ADMIN_SESSION[token]) {
    return res.status(401).json({ authenticated: false });
  }
  
  res.json({ authenticated: true });
});

// ADMIN ENDPOINTS

// Get all donors with donation history
app.get('/api/admin/donors', verifyAdminToken, (req, res) => {
  db.all(
    `SELECT d.id, d.student_id, d.name, d.blood_group, d.address, d.phone_number, d.level, d.term, d.created_at,
            MAX(dn.donation_date) as last_donation_date,
            COUNT(dn.id) as total_donations
     FROM donors d
     LEFT JOIN donations dn ON d.id = dn.donor_id
     GROUP BY d.id
     ORDER BY d.name`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Record a donation
app.post('/api/admin/donations', verifyAdminToken, (req, res) => {
  const { donor_id, donation_date } = req.body;

  if (!donor_id || !donation_date) {
    return res.status(400).json({ error: 'Donor ID and donation date are required' });
  }

  db.run(
    `INSERT INTO donations (donor_id, donation_date) VALUES (?, ?)`,
    [donor_id, donation_date],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        donor_id,
        donation_date,
      });
    }
  );
});

// Get donation history for a donor
app.get('/api/admin/donations/:donor_id', verifyAdminToken, (req, res) => {
  const { donor_id } = req.params;

  db.all(
    `SELECT * FROM donations WHERE donor_id = ? ORDER BY donation_date DESC`,
    [donor_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Close database on exit
process.on('exit', () => {
  db.close();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
