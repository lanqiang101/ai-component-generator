import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Declare process variable (needed in ES Module environment)
const process = globalThis.process || { env: {} };

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Register routes
import { registerGenerationRoutes } from './routes/generate.js';
import { registerRequirementsRoutes } from './routes/requirements.js';

registerGenerationRoutes(app);
registerRequirementsRoutes(app);

// Start server
app.listen(PORT, () => {
  console.log(`AI Component Generator backend service running at http://localhost:${PORT}`);
  console.log('Model configuration stored in frontend localStorage, backend only does API proxy');
});
