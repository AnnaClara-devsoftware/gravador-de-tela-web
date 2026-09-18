import { Pool, type QueryResultRow } from 'pg';
import { env } from '../env';

// Provedores gerenciados (Neon, Supabase, Render, Railway...) exigem TLS;
// um Postgres local (docker-compose incluso neste projeto) normalmente não
// tem certificado configurado. Detectamos pelo host em vez de exigir mais
// uma variável de ambiente: "localhost"/"127.0.0.1" = sem SSL, qualquer
// outro host = SSL habilitado automaticamente.
const isLocalDatabase = /localhost|127\.0\.0\.1/.test(env.DATABASE_URL);

// Pool único de conexões PostgreSQL para todo o processo.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
  ssl: isLocalDatabase ? undefined : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
