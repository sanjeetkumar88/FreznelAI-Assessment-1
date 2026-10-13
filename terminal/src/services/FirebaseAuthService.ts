import type { AuthSession } from '../models.js';
import { config } from '../config.js';

export class FirebaseAuthService {
  async signIn(email: string, password: string): Promise<AuthSession> {
    return this.authenticate('signInWithPassword', email, password);
  }

  async signUp(email: string, password: string): Promise<AuthSession> {
    return this.authenticate('signUp', email, password);
  }

  private async authenticate(
    method: 'signInWithPassword' | 'signUp',
    email: string,
    password: string,
  ): Promise<AuthSession> {
    if (!config.firebaseApiKey) {
      throw new Error('FIREBASE_API_KEY is missing in terminal/.env');
    }
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${config.firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    const body = (await response.json()) as { idToken?: string; email?: string; error?: { message?: string } };
    if (!response.ok || !body.idToken || !body.email) {
      throw new Error(this.translateError(body.error?.message));
    }
    return { idToken: body.idToken, email: body.email };
  }

  private translateError(code?: string): string {
    const messages: Record<string, string> = {
      EMAIL_EXISTS: 'An account with this email already exists.',
      INVALID_LOGIN_CREDENTIALS: 'Invalid email or password.',
      INVALID_PASSWORD: 'Password must be at least six characters.',
      INVALID_EMAIL: 'Enter a valid email address.',
    };
    return messages[code ?? ''] ?? 'Firebase authentication failed.';
  }
}
