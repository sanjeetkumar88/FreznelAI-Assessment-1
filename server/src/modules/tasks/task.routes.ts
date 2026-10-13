import { Router } from 'express';

import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';

const controller = new TaskController(new TaskService());
export const taskRouter = Router().get('/', requireAuth, asyncHandler(controller.list));
