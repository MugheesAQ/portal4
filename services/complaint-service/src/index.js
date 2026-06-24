const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const promClient = require('prom-client');
const { Pool } = require('pg');
require('dotenv').config();

const axios = require('axios');

const app = express();
const port = process.env.PORT || 3003;

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
  res.json({ status: "ok", service: "complaint-service", uptime: process.uptime() });
});

// DB setup
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'citizen_portal',
  user: process.env.POSTGRES_USER || 'desc_admin',
  password: process.env.POSTGRES_PASSWORD || 'desc_secure_2026'
});

app.post('/', async (req, res) => {
  try {
    const { citizen_cnic, category, title, description, location } = req.body;
    const result = await pool.query(
      'INSERT INTO complaints (citizen_cnic, category, title, description, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [citizen_cnic, category, title, description, location]
    );
    // trigger notification
    try {
      await axios.post(process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004', {
        citizen_cnic, complaint_id: result.rows[0].id, message: `Your complaint "${title}" has been registered.`
      });
    } catch(e) { console.error("Notification failed", e.message); }
    res.json({ success: true, data: result.rows[0] });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/citizen/:cnic', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM complaints WHERE citizen_cnic = $1 ORDER BY created_at DESC', [req.params.cnic]);
    res.json({ success: true, data: result.rows });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM complaints ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/:id/status', async (req, res) => {
  try {
    const { status, officer_id, note } = req.body;
    const old = await pool.query('SELECT status, citizen_cnic FROM complaints WHERE id = $1', [req.params.id]);
    
    await pool.query('UPDATE complaints SET status=$1, assigned_officer_id=$2, updated_at=NOW() WHERE id=$3', [status, officer_id, req.params.id]);
    
    await pool.query('INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, note) VALUES ($1, $2, $3, $4, $5)',
      [req.params.id, old.rows[0].status, status, officer_id, note]);

    // trigger notification
    try {
      await axios.post(process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004', {
        citizen_cnic: old.rows[0].citizen_cnic, complaint_id: req.params.id, message: `Your complaint status changed to ${status}.`
      });
    } catch(e) { console.error("Notification failed"); }

    res.json({ success: true, data: { updated: true } });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/:id', async (req, res) => {
  try {
    const c = await pool.query('SELECT * FROM complaints WHERE id=$1', [req.params.id]);
    const h = await pool.query('SELECT * FROM complaint_history WHERE complaint_id=$1 ORDER BY changed_at ASC', [req.params.id]);
    res.json({ success: true, data: { ...c.rows[0], history: h.rows } });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`complaint-service listening on port ${port}`);
});
