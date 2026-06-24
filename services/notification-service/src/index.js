const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const promClient = require('prom-client');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3004;

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
  res.json({ status: "ok", service: "notification-service", uptime: process.uptime() });
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
    const { citizen_cnic, complaint_id, message } = req.body;
    await pool.query('INSERT INTO notifications (citizen_cnic, complaint_id, message) VALUES ($1, $2, $3)', [citizen_cnic, complaint_id, message]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/:cnic', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE citizen_cnic = $1 ORDER BY created_at DESC', [req.params.cnic]);
    res.json({ success: true, data: result.rows });
  } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});

app.patch('/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});

app.listen(port, () => {
  console.log(`notification-service listening on port ${port}`);
});
