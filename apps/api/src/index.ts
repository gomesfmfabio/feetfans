import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint (required for Story 1.3)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'feetfans-api',
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
