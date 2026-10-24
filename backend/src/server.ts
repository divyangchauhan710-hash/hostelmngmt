import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import messRoutes from './routes/messRoutes.js';
import canteenRoutes from './routes/canteenRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL || '',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Serve uploaded attachments statically
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API health endpoint
app.get('/api/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    service: 'HostelHub API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handler
app.use(errorHandler);

// ── Production: serve compiled React frontend ──────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  // Catch-all: return index.html so React Router handles client-side routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async (conn) => {
    // ── Auto-seed on first run (no shell needed on free hosting) ────────────
    if (conn) {
      try {
        const { User } = await import('./models/User.js');
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('[HostelHub] Empty database detected — running auto-seed...');
          const { seedDatabase } = await import('./seeds/seed.js');
          await seedDatabase();
          console.log('[HostelHub] Auto-seed complete. Demo accounts are ready.');
        }
      } catch (seedErr) {
        console.error('[HostelHub] Auto-seed failed (non-fatal):', seedErr);
      }
    }

    app.listen(PORT, () => {
      console.log(`[HostelHub] Backend server listening on port ${PORT}`);
    });
  });
}

