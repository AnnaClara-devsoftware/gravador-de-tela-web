import { createApp } from './app';
import { env } from './env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Gravador de Tela API rodando em http://localhost:${env.PORT}`);
  console.log(`Ambiente: ${env.NODE_ENV}`);
});
