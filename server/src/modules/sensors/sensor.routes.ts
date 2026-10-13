import { Router } from 'express';

import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { SensorController } from './sensor.controller.js';
import { SensorService } from './sensor.service.js';

const controller = new SensorController(new SensorService());
export const sensorRouter = Router().get('/', requireAuth, asyncHandler(controller.snapshot));
