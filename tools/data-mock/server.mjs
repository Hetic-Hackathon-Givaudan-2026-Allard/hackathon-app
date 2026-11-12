import console from 'node:console';
import process from 'node:process';
import { createApp } from './app.mjs';

const port = Number(process.env.PORT || 8000);
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim());
const server = createApp({ origins }).listen(port, '0.0.0.0', () =>
  console.log(
    `Mock Data Express sur le port ${port} — données fictives, sans IA réelle.`,
  ),
);
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
