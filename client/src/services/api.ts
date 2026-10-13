const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiClient {
  async get<T>(path: string, token: string): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? 'Request failed');
    return body.data as T;
  }
}
