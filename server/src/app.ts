import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { sensorRouter } from './modules/sensors/sensor.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { sendSuccess } from './shared/http/response.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));
app.use(apiRateLimiter);

const api = express.Router();
api.get('/health', (_request, response) => sendSuccess(response, { status: 'ok' }));
api.use('/tasks', taskRouter);
api.use('/sensors', sensorRouter);
app.use('/api/v1', api);
app.use(notFoundHandler);
app.use(errorHandler);
