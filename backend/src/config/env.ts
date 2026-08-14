import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  googleClientId: required('GOOGLE_CLIENT_ID'),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET'),
  googleCallbackUrl: required('GOOGLE_CALLBACK_URL'),
  frontendUrl: required('FRONTEND_URL'),
  port: Number(process.env.BACKEND_PORT ?? 3000),
  isProduction: process.env.NODE_ENV === 'production'
};

