process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/test';
process.env.JWT_SECRET ??= 'test-secret';
process.env.GOOGLE_CLIENT_ID ??= 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET ??= 'test-client-secret';
process.env.GOOGLE_CALLBACK_URL ??= 'http://localhost:3000/api/auth/google/callback';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
