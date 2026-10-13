import { freemem, loadavg, totalmem, uptime } from 'node:os';

import type { SensorSnapshot } from './sensor.model.js';

export class SensorService {
  async snapshot(): Promise<SensorSnapshot> {
    const total = totalmem();
    const free = freemem();
    return {
      cpuLoadPercent: Number(Math.min(100, Math.max(0, loadavg()[0] * 100 / Math.max(1, (await import('node:os')).cpus().length))).toFixed(1)),
      memoryUsedPercent: Number((((total - free) / total) * 100).toFixed(1)),
      memoryUsedMb: Number(((total - free) / 1024 / 1024).toFixed(1)),
      memoryTotalMb: Number((total / 1024 / 1024).toFixed(1)),
      uptimeSeconds: uptime(),
      loadAverage: loadavg().map((value) => Number(value.toFixed(2))),
      capturedAt: new Date().toISOString(),
    };
  }
}
