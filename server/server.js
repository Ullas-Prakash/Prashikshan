require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { seedIfEnabled } = require('./services/seedData');

const authRoutes        = require('./routes/authRoutes');
const assessmentRoutes  = require('./routes/assessmentRoutes');
const courseRoutes      = require('./routes/courseRoutes');
const internshipRoutes  = require('./routes/internshipRoutes');
const coordinatorRoutes = require('./routes/coordinatorRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

const app = express();
const port = Number(process.env.PORT || 5000);
const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(cors({ origin(origin, callback) { return !origin || clientOrigins.includes(origin) ? callback(null, true) : callback(new Error('Origin not allowed by CORS')); } }));
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'prashikshan-api', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes.router);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/coordination', coordinatorRoutes);
app.use('/api/certificates', certificateRoutes);

const clientBuild = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientBuild, { index: false, maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.get(/^(?!\/api).*/, (_req, res, next) => {
  res.sendFile(path.join(clientBuild, 'index.html'), (error) => { if (error) next(); });
});

app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.name === 'ValidationError') return res.status(400).json({ error: Object.values(error.errors).map((item) => item.message).join(' ') });
  if (error?.name === 'CastError') return res.status(400).json({ error: 'Invalid resource identifier.' });
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function start() {
  let mongoUri = process.env.MONGO_URI;
  let connected = false;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      connected = true;
    } catch (err) {
      console.log('Local/Remote MONGO_URI connection failed. Falling back to in-memory MongoDB...');
    }
  }

  if (!connected) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('Started and connected to in-memory MongoDB instance for development.');
    } catch (err) {
      throw new Error('Failed to start in-memory MongoDB or connect to MONGO_URI: ' + err.message);
    }
  }

  await seedIfEnabled();
  app.listen(port, () => console.log(`Prashikshan is running on port ${port}`));
}

if (require.main === module) start().catch((error) => { console.error(error.message); process.exit(1); });
module.exports = { app, start };
