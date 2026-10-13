import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { SystemTask } from './task.model.js';
import type { TaskQuery } from './task.schema.js';

const execFileAsync = promisify(execFile);

export class TaskService {
  async list(query: TaskQuery): Promise<SystemTask[]> {
    const tasks = process.platform === 'win32' ? await this.fromWindows() : await this.fromUnix();
    const search = query.search?.toLowerCase();
    const filtered = search ? tasks.filter((task) => task.name.toLowerCase().includes(search)) : tasks;
    const sorted = [...filtered].sort((a, b) => {
      const left = query.sortBy === 'name' ? a.name : query.sortBy === 'memory' ? a.memoryMb : a.cpuPercent;
      const right = query.sortBy === 'name' ? b.name : query.sortBy === 'memory' ? b.memoryMb : b.cpuPercent;
      return (left < right ? -1 : left > right ? 1 : 0) * (query.order === 'asc' ? 1 : -1);
    });
    return sorted.slice(0, query.limit);
  }

  private async fromWindows(): Promise<SystemTask[]> {
    const { stdout } = await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-Command',
      'Get-Process | Select-Object Id,ProcessName,CPU,WorkingSet64 | ConvertTo-Json -Compress',
    ]);
    const parsed: Array<{ Id: number; ProcessName: string; CPU?: number; WorkingSet64?: number }> =
      JSON.parse(stdout || '[]');
    return (Array.isArray(parsed) ? parsed : [parsed]).map((task) => ({
      pid: task.Id,
      name: task.ProcessName,
      cpuPercent: Number((task.CPU ?? 0).toFixed(1)),
      memoryMb: Number(((task.WorkingSet64 ?? 0) / 1024 / 1024).toFixed(1)),
      status: 'running',
    }));
  }

  private async fromUnix(): Promise<SystemTask[]> {
    const { stdout } = await execFileAsync('ps', ['-eo', 'pid=,comm=,%cpu=,rss=,stat=']);
    return stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const match = line.trim().match(/^(\d+)\s+(\S+)\s+([\d.]+)\s+(\d+)\s+(\S+)/);
        return match
          ? { pid: Number(match[1]), name: match[2], cpuPercent: Number(match[3]), memoryMb: Number((Number(match[4]) / 1024).toFixed(1)), status: match[5] }
          : null;
      })
      .filter((task): task is SystemTask => task !== null);
  }
}
