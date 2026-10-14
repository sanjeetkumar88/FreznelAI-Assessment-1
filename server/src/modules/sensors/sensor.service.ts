import { execFile } from 'node:child_process';
import { freemem, loadavg, totalmem, uptime } from 'node:os';
import { promisify } from 'node:util';

import type { SensorSnapshot } from './sensor.model.js';

const execFileAsync = promisify(execFile);

export class SensorService {
  async snapshot(): Promise<SensorSnapshot> {
    const total = totalmem();
    const free = freemem();
    const cpuLoadPercent = await this.cpuLoadPercent();
    return {
      cpuLoadPercent,
      memoryUsedPercent: Number((((total - free) / total) * 100).toFixed(1)),
      memoryUsedMb: Number(((total - free) / 1024 / 1024).toFixed(1)),
      memoryTotalMb: Number((total / 1024 / 1024).toFixed(1)),
      uptimeSeconds: uptime(),
      loadAverage: loadavg().map((value) => Number(value.toFixed(2))),
      capturedAt: new Date().toISOString(),
    };
  }

  private async cpuLoadPercent(): Promise<number> {
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execFileAsync('powershell.exe', [
          '-NoProfile',
          '-Command',
          "(Get-Counter '\\Processor(_Total)\\% Processor Time').CounterSamples.CookedValue",
        ]);
        const value = Number.parseFloat(stdout.trim());
        if (Number.isFinite(value)) return Number(Math.min(100, Math.max(0, value)).toFixed(1));
      } catch {
        return 0;
      }
      return 0;
    }

    const cpus = (await import('node:os')).cpus().length;
    return Number(Math.min(100, Math.max(0, loadavg()[0] * 100 / Math.max(1, cpus))).toFixed(1));
  }
}
