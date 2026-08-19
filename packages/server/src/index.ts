
import express, { Request, Response } from 'express';
import cors from 'cors';

import { handleCounts, handleAddOffDay, handleRemoveOffDay, handleImportDayOffs } from './counts/handler';
import { handleReport, handlePushReport } from './reports/handler';
import { handleGetSettings, handleSetSettings } from './settings/handler';
import { handleGetProjectDict, handleAddProjectCode, handleRemoveProjectCode } from './reports/project-dict-handler';
import { setupProxy } from './utils/setup-proxy';

setupProxy();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/counts/:id', handleCounts);
app.post('/api/counts/:id/off-days', handleAddOffDay);
app.delete('/api/counts/:id/off-days/:date', handleRemoveOffDay);
app.post('/api/counts/:id/import-day-offs', handleImportDayOffs);
app.get('/api/reports', handleReport);
app.post('/api/reports/push-to-bridge', handlePushReport);
app.get('/api/settings', handleGetSettings);
app.post('/api/settings', handleSetSettings);
app.get('/api/project-dict', handleGetProjectDict);
app.post('/api/project-dict', handleAddProjectCode);
app.delete('/api/project-dict/:code', handleRemoveProjectCode);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Express + TypeScript Server!' });
});

const server = app.listen(port, () => {
  console.log(`🚀 The server is running at http://localhost:${port}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Порт ${port} уже занят другим процессом. Задайте свободный порт через PORT в packages/server/.env и перезапустите.`);
    process.exit(1);
  }

  throw err;
});
