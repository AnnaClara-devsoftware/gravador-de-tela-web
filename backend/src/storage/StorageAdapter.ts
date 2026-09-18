export interface StorageAdapter {
  /** Salva o buffer sob a chave dada e retorna a chave efetivamente usada. */
  save(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  /** Retorna uma URL pela qual o arquivo pode ser baixado/reproduzido. */
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
