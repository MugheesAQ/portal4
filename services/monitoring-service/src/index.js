const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const promClient = require('prom-client');
const { Pool } = require('pg');
require('dotenv').config();

const axios = require('axios');

const app = express();
const port = process.env.PORT || 3005;

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
  res.json({ status: "ok", service: "monitoring-service", uptime: process.uptime() });
});

// DB setup
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'citizen_portal',
  user: process.env.POSTGRES_USER || 'desc_admin',
  password: process.env.POSTGRES_PASSWORD || 'desc_secure_2026'
});

const services = [
  { name: 'auth', url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001' },
  { name: 'citizen', url: process.env.CITIZEN_SERVICE_URL || 'http://citizen-service:3002' },
  { name: 'complaint', url: process.env.COMPLAINT_SERVICE_URL || 'http://complaint-service:3003' },
  { name: 'notification', url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004' },
  { name: 'monitoring', url: 'http://localhost:3005' }
];

app.get('/health/all', async (req, res) => {
  const results = await Promise.all(services.map(async s => {
    const start = Date.now();
    try {
      await axios.get(s.url + '/health', { timeout: 2000 });
      return { service: s.name, status: 'Healthy', latency_ms: Date.now() - start, last_checked: new Date() };
    } catch(e) {
      return { service: s.name, status: 'Down', latency_ms: 0, last_checked: new Date() };
    }
  }));
  res.json({ success: true, data: results });
});

app.listen(port, () => {
  console.log(`monitoring-service listening on port ${port}`);
});
