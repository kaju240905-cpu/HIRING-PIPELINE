import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import applicationRoutes from './routes/applicationRoutes';
import pipelineRoutes from './routes/pipelineRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/applications', applicationRoutes);
app.use('/api/applications', pipelineRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
