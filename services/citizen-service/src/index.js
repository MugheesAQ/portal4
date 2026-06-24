const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const promClient = require('prom-client');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

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
  res.json({ status: "ok", service: "citizen-service", uptime: process.uptime() });
});

// DB setup
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'citizen_portal',
  user: process.env.POSTGRES_USER || 'desc_admin',
  password: process.env.POSTGRES_PASSWORD || 'desc_secure_2026'
});

app.get('/profile/:cnic', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, cnic, phone, email, profile_pic FROM citizens WHERE cnic = $1', [req.params.cnic]);
    res.json({ success: true, data: result.rows[0] });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.put('/profile/:cnic', async (req, res) => {
  try {
    const { email, phone, profile_pic } = req.body;
    await pool.query('UPDATE citizens SET email=$1, phone=$2, profile_pic=$3 WHERE cnic=$4', [email, phone, profile_pic, req.params.cnic]);
    res.json({ success: true, data: { updated: true } });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/officer/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, badge_number, department, email, profile_pic FROM officers WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.put('/officer/:id', async (req, res) => {
  try {
    const { email, profile_pic } = req.body;
    await pool.query('UPDATE officers SET email=$1, profile_pic=$2 WHERE id=$3', [email, profile_pic, req.params.id]);
    res.json({ success: true, data: { updated: true } });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`citizen-service listening on port ${port}`);
});
