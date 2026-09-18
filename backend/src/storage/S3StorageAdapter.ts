import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageAdapter } from './StorageAdapter';

interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Necessário para provedores S3-compatíveis que não são a AWS (ex.: Cloudflare R2, Backblaze B2). */
  endpoint?: string;
  /** Se o bucket tiver um domínio público (CDN), usamos URLs diretas em vez de assinadas. */
  publicUrlBase?: string;
}

/**
 * Funciona com qualquer provedor compatível com a API do S3: AWS S3,
 * Cloudflare R2, Backblaze B2, MinIO, etc. — basta apontar S3_ENDPOINT
 * para o provedor escolhido.
 */
export class S3StorageAdapter implements StorageAdapter {
  private readonly client: S3Client;

  constructor(private readonly config: S3StorageConfig) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: !!config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async save(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return key;
  }

  async getUrl(key: string): Promise<string> {
    if (this.config.publicUrlBase) {
      return `${this.config.publicUrlBase.replace(/\/$/, '')}/${key}`;
    }
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.config.bucket, Key: key }), {
      expiresIn: 3600,
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }
}
