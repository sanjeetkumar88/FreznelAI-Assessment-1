import React, { useState } from 'react';
import { render } from 'ink';

import { AuthScreen } from './components/AuthScreen.js';
import { Dashboard } from './components/Dashboard.js';
import type { AuthSession } from './models.js';

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  return session ? <Dashboard session={session} /> : <AuthScreen onAuthenticated={setSession} />;
}

render(<App />);
