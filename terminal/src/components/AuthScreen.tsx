import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

import type { AuthSession } from '../models.js';
import { FirebaseAuthService } from '../services/FirebaseAuthService.js';

type Props = { onAuthenticated: (session: AuthSession) => void };

export function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [field, setField] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Tab switches fields • Enter submits • S toggles sign-up/sign-in');
  const auth = new FirebaseAuthService();

  useInput((input, key) => {
    if (key.ctrl && input === 'c') process.exit(0);
    if (input.toLowerCase() === 's' && !email && !password) {
      setMode((current) => (current === 'signup' ? 'signin' : 'signup'));
      return;
    }
    if (key.tab) {
      setField((current) => (current === 'email' ? 'password' : 'email'));
      return;
    }
    if (key.return) {
      void submit();
      return;
    }
    if (key.backspace) {
      field === 'email' ? setEmail((value) => value.slice(0, -1)) : setPassword((value) => value.slice(0, -1));
      return;
    }
    if (!key.ctrl && !key.meta && input && input.length === 1) {
      field === 'email' ? setEmail((value) => value + input) : setPassword((value) => value + input);
    }
  });

  const submit = async () => {
    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }
    try {
      setMessage('Authenticating...');
      const session = mode === 'signup' ? await auth.signUp(email, password) : await auth.signIn(email, password);
      onAuthenticated(session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="greenBright">FREZNEL AI / SYSTEM MONITOR</Text>
      <Text bold>{mode === 'signup' ? 'Create account' : 'Sign in'}</Text>
      <Text color="gray">Firebase Authentication</Text>
      <Box marginTop={1} flexDirection="column">
        <Text color={field === 'email' ? 'greenBright' : undefined}>Email:    {email || 'type email'}</Text>
        <Text color={field === 'password' ? 'greenBright' : undefined}>
          Password: {password ? '*'.repeat(password.length) : 'type password'}
        </Text>
      </Box>
      <Box marginTop={1}><Text color="yellow">{message}</Text></Box>
    </Box>
  );
}
