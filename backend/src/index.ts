import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import pipelineRoutes from './routes/pipelineRoutes';
import authRoutes from './routes/authRoutes';
import { getDashboardMetrics } from './controllers/dashboardController';
import { exportApplicationsCsv } from './controllers/csvController';
import { requireAuth } from './middleware/authMiddleware';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/applications', pipelineRoutes);

app.get('/api/dashboard', requireAuth, getDashboardMetrics);
app.get('/api/csv', requireAuth, exportApplicationsCsv);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
