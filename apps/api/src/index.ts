import express from 'express';
import { HealthResponse } from '@teacher-ai/contracts';
const app = express();
app.get('/api/v1/health', (req, res) => {
  const response: HealthResponse = { status: 'ok' };
  res.json(response);
});
app.listen(3000, () => console.log('API running on port 3000'));