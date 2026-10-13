import 'dotenv/config';

export const config = {
  apiUrl: process.env.API_URL ?? 'http://localhost:4000/api/v1',
  firebaseApiKey: process.env.FIREBASE_API_KEY ?? '',
};
