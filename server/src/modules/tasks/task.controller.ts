import type { Request, Response } from 'express';

import { sendSuccess } from '../../shared/http/response.js';
import { taskQuerySchema } from './task.schema.js';
import { TaskService } from './task.service.js';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  list = async (request: Request, response: Response) => {
    const query = taskQuerySchema.parse(request.query);
    sendSuccess(response, await this.service.list(query));
  };
}
