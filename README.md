# Binaire_Freznel_Assessment

Modular system task and sensor viewer. The project has an Express/TypeScript API
and a React/Vite frontend. Firebase Authentication is used by the frontend; the
API receives the Firebase ID token and verifies it when Firebase Admin
credentials are configured.

## Run locally

```bash
npm run install:all
copy server\.env.example server\.env
copy client\.env.example client\.env
npm run dev
```

Set the Firebase Web configuration in `client/.env`. At minimum,
`VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` are required for
email/password sign-up and sign-in. Enable **Email/Password** under Firebase
Authentication > Sign-in method.

The server uses a separate Firebase Admin service account. Its
`FIREBASE_PRIVATE_KEY` must be the PEM private key from the service-account JSON
file; a Firebase Web API key is not a private key and must not be placed in that
variable. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
`FIREBASE_PRIVATE_KEY` in `server/.env` so authenticated API requests can be
verified.

The API is available at `http://localhost:4000/api/v1`; the dashboard is at
`http://localhost:5173`.

The API still runs without Firebase Admin credentials in development, but
protected routes require a valid Firebase token once `FIREBASE_PROJECT_ID` and
credentials are configured.

## Terminal application

The assessment terminal UI is in `terminal/`. Configure `terminal/.env` from
`terminal/.env.example`, including the Firebase Web API key, then run:

```bash
npm run install:all
npm run dev:terminal
```

The terminal UI supports sign-up/sign-in, `Tab` field navigation, numeric
screen navigation (`1`, `2`, `3`), arrow-key task selection, `R` refresh, and
`Q`/`Ctrl+C` exit. Ink re-renders from the terminal width so the navigation
switches between horizontal and vertical layouts when the terminal is resized.
It uses the Firebase Identity Toolkit API for email/password authentication
and the existing authenticated `/api/v1` API for system data.

The implementation separates responsibilities into classes: `FirebaseAuthService`
handles Firebase authentication, `ApiService` handles authenticated API
requests, `TaskService` reads processes, and `SensorService` reads system
telemetry. The UI components only coordinate state and keyboard interaction.

## Repository layout

```text
client/    React browser dashboard
server/    Express API and system data services
terminal/  Ink terminal dashboard
```

The old root-level template source and Vite files have been removed. Root
scripts now only orchestrate the three active applications.
