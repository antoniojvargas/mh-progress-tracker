process.env.DATABASE_URL ??= 'postgresql://mh_test:mh_test@localhost:5433/mh_test_integration';
process.env.JWT_SECRET ??= 'integration-test-secret';
process.env.GOOGLE_CLIENT_ID ??= 'integration-client-id';
process.env.GOOGLE_CLIENT_SECRET ??= 'integration-client-secret';
process.env.GOOGLE_CALLBACK_URL ??= 'http://localhost:3000/api/auth/google/callback';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
