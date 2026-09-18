import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { StorageAdapter } from './StorageAdapter';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

/**
 * Armazenamento em disco local. É o padrão em desenvolvimento — funciona
 * sem nenhuma configuração externa. Não é adequado para produção com mais
 * de uma instância do backend (o disco não é compartilhado entre elas);
 * para isso, configure as variáveis S3_* e o backend passa a usar
 * automaticamente o S3StorageAdapter.
 */
export class LocalDiskStorageAdapter implements StorageAdapter {
  constructor(private readonly publicBaseUrl: string) {}

  private async ensureDir(): Promise<void> {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }

  async save(key: string, buffer: Buffer): Promise<string> {
    await this.ensureDir();
    const filePath = path.join(UPLOADS_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return key;
  }

  async getUrl(key: string): Promise<string> {
    return `${this.publicBaseUrl}/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, key);
    await fs.rm(filePath, { force: true });
  }
}
