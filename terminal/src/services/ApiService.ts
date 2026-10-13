import { config } from '../config.js';
import type { Sensors, Task } from '../models.js';

export class ApiService {
  async getTasks(token: string): Promise<Task[]> {
    return this.get<Task[]>('/tasks', token);
  }

  async getSensors(token: string): Promise<Sensors> {
    return this.get<Sensors>('/sensors', token);
  }

  private async get<T>(path: string, token: string): Promise<T> {
    const response = await fetch(`${config.apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = (await response.json()) as { data?: T; error?: { message?: string } };
    if (!response.ok || body.data === undefined) {
      throw new Error(body.error?.message ?? 'The API request failed.');
    }
    return body.data;
  }
}
