# Binaire Freznel Assessment

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

The API is available at `http://localhost:4000/api/v1`; the dashboard is at
`http://localhost:5173`.

The API still runs without Firebase Admin credentials in development, but
protected routes require a valid Firebase token once `FIREBASE_PROJECT_ID` and
credentials are configured.
