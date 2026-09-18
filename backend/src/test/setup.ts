// Garante variáveis de ambiente válidas para os testes, antes que qualquer
// módulo leia `process.env` (ver src/env.ts).
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-with-enough-length';
process.env.CORS_ORIGIN = 'http://localhost:5173';
