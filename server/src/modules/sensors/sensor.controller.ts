import type { Response } from 'express';

import { sendSuccess } from '../../shared/http/response.js';
import { SensorService } from './sensor.service.js';

export class SensorController {
  constructor(private readonly service: SensorService) {}

  snapshot = async (_request: unknown, response: Response) => {
    sendSuccess(response, await this.service.snapshot());
  };
}
