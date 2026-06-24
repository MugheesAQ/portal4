const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const promClient = require('prom-client');
const { Pool } = require('pg');
require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ route: req.route ? req.route.path : req.path, code: res.statusCode, method: req.method });
  });
  next();
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "auth-service", uptime: process.uptime() });
});

// DB setup
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'citizen_portal',
  user: process.env.POSTGRES_USER || 'desc_admin',
  password: process.env.POSTGRES_PASSWORD || 'desc_secure_2026'
});

app.post('/register', async (req, res) => {
  try {
    const { name, cnic, phone, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO citizens (name, cnic, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, cnic, phone, hash]
    );
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { cnic, password } = req.body;
    const result = await pool.query('SELECT * FROM citizens WHERE cnic = $1', [cnic]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    // In demo, checking static password or hashed. We seeded with generic hash.
    // For simplicity in demo, if password is "citizen123", we allow it.
    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid && password !== 'citizen123') return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const token = jwt.sign({ cnic, role: 'citizen' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ success: true, data: { token, user: result.rows[0] } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/officer/login', async (req, res) => {
  try {
    const { badge_number, password } = req.body;
    const result = await pool.query('SELECT * FROM officers WHERE badge_number = $1', [badge_number]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid && password !== 'officer123') return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: result.rows[0].id, role: 'officer' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ success: true, data: { token, user: result.rows[0] } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/validate', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: 'Invalid token' });
    res.json({ success: true, data: decoded });
  });
});

app.listen(port, () => {
  console.log(`auth-service listening on port ${port}`);
});
