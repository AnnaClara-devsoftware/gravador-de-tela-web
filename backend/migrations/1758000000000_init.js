/**
 * Migração inicial do banco. Rodar com:
 *   npm run prisma... (não — ver package.json: npm run migrate:up)
 *
 * Este arquivo usa a API do node-pg-migrate, que gera SQL padrão do
 * PostgreSQL — nenhum binário nativo externo é necessário (ao contrário de
 * ferramentas como Prisma, que baixam engines pré-compiladas).
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'text', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('recordings', {
    id: { type: 'uuid', primaryKey: true },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    name: { type: 'text', notNull: true },
    duration_ms: { type: 'integer', notNull: true },
    size_bytes: { type: 'bigint', notNull: true },
    mime_type: { type: 'text', notNull: true },
    storage_key: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('recordings', 'user_id');

  pgm.createTable('share_links', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    token: { type: 'uuid', notNull: true, unique: true, default: pgm.func('gen_random_uuid()') },
    recording_id: {
      type: 'uuid',
      notNull: true,
      references: 'recordings',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    expires_at: { type: 'timestamptz', notNull: true },
  });
  pgm.createIndex('share_links', 'recording_id');
};

exports.down = (pgm) => {
  pgm.dropTable('share_links');
  pgm.dropTable('recordings');
  pgm.dropTable('users');
};
