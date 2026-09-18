import { env, isS3Configured } from '../env';
import type { StorageAdapter } from './StorageAdapter';
import { LocalDiskStorageAdapter } from './LocalDiskStorageAdapter';
import { S3StorageAdapter } from './S3StorageAdapter';

let adapter: StorageAdapter | null = null;

/** Seleciona o provedor de armazenamento com base nas variáveis de ambiente disponíveis. */
export function getStorageAdapter(): StorageAdapter {
  if (adapter) return adapter;

  if (isS3Configured) {
    adapter = new S3StorageAdapter({
      bucket: env.S3_BUCKET!,
      region: env.S3_REGION ?? 'auto',
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      endpoint: env.S3_ENDPOINT,
      publicUrlBase: env.S3_PUBLIC_URL,
    });
  } else {
    adapter = new LocalDiskStorageAdapter(`http://localhost:${env.PORT}`);
  }

  return adapter;
}
