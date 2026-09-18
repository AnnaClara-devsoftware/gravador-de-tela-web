# Gravador de Tela

Aplicação web full-stack para gravar tela, microfone e webcam diretamente do navegador, sem instalar nada. Projeto de portfólio focado em backend, com frontend em React/TypeScript e um backend Node/Express/PostgreSQL com propósito real (contas, sincronização e compartilhamento), não decorativo.

Esse site resolve um problema real que muitas pessoas com computadores fracos tem. O objetivo é fazer com que o usuário do PC fraco não precise instalar nada em seu computador, porém sem perder o benefício de gravar a tela.

**A gravação em si acontece 100% no navegador.** Nenhum frame de vídeo passa pelo backend a menos que o usuário ative explicitamente o backup em nuvem (recurso opcional).

---

## Sumário

- [Demonstração](#demonstração)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Deploy](#deploy)
- [Compatibilidade](#compatibilidade)
- [Privacidade](#privacidade)
- [Segurança](#segurança)
- [Limitações conhecidas](#limitações-conhecidas)
- [Decisões arquiteturais](#decisões-arquiteturais)
- [Próximos passos](#próximos-passos)

---

## Demonstração

A aplicação tem três áreas principais:

1. **Landing page** (`/`) — apresentação do produto, como funciona, recursos, privacidade e stack.
2. **Gravar** (`/gravar`) — tela de configuração e gravação (qualidade, microfone, webcam, áudio do sistema).
3. **Minhas gravações** (`/gravacoes`) — biblioteca local com busca, filtros, player, download e exclusão.
4. **Compatibilidade** (`/compatibilidade`) — o que o seu navegador suporta agora, e uma matriz comparativa entre navegadores.

## Funcionalidades

- Captura de tela inteira, janela ou aba (via `getDisplayMedia`)
- Microfone e webcam opcionais (via `getUserMedia`)
- Webcam sobreposta em bolha, com posição e tamanho configuráveis (composição em `<canvas>`)
- Áudio do sistema quando o navegador/SO permitir, com aviso claro quando não permitir
- Qualidade ajustável (Automática/Alta/Média/Baixa), com detecção de codecs suportados
- Iniciar, pausar, retomar, finalizar e cancelar a gravação, com contador em tempo real
- Preview ao vivo durante a gravação
- Biblioteca local (IndexedDB): busca, ordenação, filtros, seleção múltipla e exclusão em lote
- Geração automática de thumbnail a partir de um frame real do vídeo
- Player customizado (play/pause, seek, volume, velocidade, tela cheia)
- Download com nome de arquivo padronizado (`gravacao-tela-AAAA-MM-DD-HH-mm.webm`)
- Painel de armazenamento local (uso estimado via `navigator.storage.estimate()`)
- Painel de compatibilidade ao vivo + matriz comparativa Chrome/Edge/Firefox/Safari
- Avisos contextuais no momento certo (não um único aviso genérico)
- PWA instalável (o "casco" da aplicação funciona offline; a gravação em si depende das APIs de mídia ao vivo do navegador, então nunca é uma funcionalidade "offline")
- **Backend opcional**: contas de usuário, sincronização de metadados, backup em nuvem do vídeo e links de compartilhamento com expiração

## Arquitetura

O vídeo gravado nunca trafega para o backend a menos que o usuário ative explicitamente a sincronização/backup em nuvem — e mesmo assim, o que trafega é o arquivo já finalizado, não um stream ao vivo da tela. Diagramas completos (visão geral, fluxo de gravação e modelo de dados) estão em [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tecnologias

**Frontend**
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router
- Dexie.js (IndexedDB)
- MediaRecorder API, Screen Capture API (`getDisplayMedia`), `getUserMedia`, Web Audio API
- Vitest + Testing Library

**Backend** (opcional)
- Node.js + TypeScript
- Express 5
- PostgreSQL (via `pg`, sem ORM com binários nativos — ver [Decisões arquiteturais](#decisões-arquiteturais))
- node-pg-migrate (migrations)
- JWT (`jsonwebtoken`) + `bcryptjs`
- Zod (validação)
- Multer (upload) + AWS SDK v3 (armazenamento S3-compatível opcional)
- Vitest + Supertest

## Estrutura de pastas

```
gravador-de-tela/
├── frontend/
│   ├── src/
│   │   ├── app/              # App shell, layout, error boundary
│   │   ├── components/       # UI, landing, recorder, library, compatibility
│   │   ├── hooks/             # useRecorder, useRecordings, useCapabilities...
│   │   ├── lib/               # engine de gravação, db (Dexie), compat, api client
│   │   ├── pages/              # rotas
│   │   └── types/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── routes/            # auth, recordings, share, stats
│   │   ├── middleware/         # auth, validação, erros
│   │   ├── storage/             # adapters: disco local / S3-compatível
│   │   ├── lib/                  # db (pg), auth (JWT/bcrypt)
│   │   └── __tests__/
│   ├── migrations/               # node-pg-migrate
│   └── Dockerfile
├── docker-compose.yml            # PostgreSQL local para desenvolvimento
└── ARCHITECTURE.md
```

## Como rodar localmente

### Frontend (funciona sozinho, sem backend)

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. Gravar, salvar, reproduzir, baixar e excluir gravações funciona inteiramente sem o backend.

### Backend (opcional)

```bash
# 1. Suba um PostgreSQL local (ou aponte DATABASE_URL para um gerenciado)
docker compose up -d

# 2. Configure as variáveis de ambiente
cd backend
cp .env.example .env
# edite .env — no mínimo, gere um JWT_SECRET forte

# 3. Instale dependências e rode as migrations
npm install
npm run migrate:up

# 4. Suba a API
npm run dev
```

A API sobe em `http://localhost:4000`. Para o frontend passar a usar os recursos de conta/sincronização, defina no `frontend/.env`:

```
VITE_API_URL=http://localhost:4000
```

## Variáveis de ambiente

| Arquivo | Variável | Obrigatória | Descrição |
|---|---|---|---|
| `frontend/.env` | `VITE_API_URL` | Não | URL do backend. Sem ela, os recursos de conta/sincronização ficam ocultos e o app funciona 100% local. |
| `backend/.env` | `DATABASE_URL` | Sim | String de conexão do PostgreSQL. |
| `backend/.env` | `JWT_SECRET` | Sim | Segredo para assinar tokens JWT (gere com `openssl rand -base64 48`). |
| `backend/.env` | `PORT` | Não (padrão 4000) | Porta da API. |
| `backend/.env` | `CORS_ORIGIN` | Não | URL do frontend permitida no CORS. |
| `backend/.env` | `MAX_UPLOAD_BYTES` | Não (padrão 500MB) | Tamanho máximo de upload de vídeo. |
| `backend/.env` | `SHARE_LINK_TTL_HOURS` | Não (padrão 72h) | Validade de um link de compartilhamento. |
| `backend/.env` | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `S3_PUBLIC_URL` | Não | Ativam armazenamento em nuvem S3-compatível. Sem elas, usa disco local. |

Veja `frontend/.env.example` e `backend/.env.example` para o arquivo completo comentado.

## Testes

```bash
# Frontend — 22 testes (formatação, detecção de compatibilidade, presets de
# qualidade, layout de webcam, repositório Dexie, smoke test da app)
cd frontend && npm run test

# Backend — 26 testes (hashing/JWT, tratamento de erros, rotas de auth e
# de gravações com banco mockado)
cd backend && npm run test
```

O que **não** foi possível testar automaticamente neste ambiente: o fluxo de gravação real ponta a ponta (passos como "conceder permissão de tela", "conceder permissão de microfone" exigem um navegador real com um humano interagindo com o diálogo nativo do sistema operacional — isso não é automatizável em CI sem um navegador headless com flags específicas, que foge do escopo de um projeto de portfólio). O que foi validado automaticamente: toda a lógica pura ao redor disso — detecção de capacidades, cálculo de qualidade, layout da webcam, persistência, geração de nomes de arquivo, e o comportamento de cada rota do backend.

## Deploy

### Passo a passo — Neon (banco) + Render (API) + Vercel (frontend)

Esta é a rota recomendada: as três partes têm tier gratuito permanente (sem cartão) e o repositório já está preparado para elas.

**1. Banco de dados (Neon, ~2 min)**

1. Acesse [console.neon.tech/signup](https://console.neon.tech/signup) e entre com GitHub ou Google.
2. Crie um projeto (qualquer nome, região mais próxima de você).
3. Na tela do projeto, copie a **Connection string** — algo como `postgres://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`. Guarde-a: é o valor de `DATABASE_URL`.

**2. Backend (Render, ~3 min)**

1. Suba este repositório para o GitHub (se ainda não estiver lá).
2. Em [dashboard.render.com](https://dashboard.render.com), **New → Blueprint**, aponte para o repositório. O arquivo `render.yaml` já incluso configura o serviço sozinho (build, start, health check).
3. Quando pedir as variáveis marcadas como "secret", preencha:
   - `DATABASE_URL`: a connection string do Neon (passo 1.3).
   - `JWT_SECRET`: gere a sua com `openssl rand -base64 48` (ou peça para eu gerar uma).
   - `CORS_ORIGIN`: a URL que a Vercel vai te dar no passo 3 (pode editar depois — não trava o deploy).
4. Deploy. O `startCommand` já roda `npm run migrate:up` antes de subir o servidor, então as tabelas são criadas automaticamente no primeiro deploy.
5. Copie a URL pública que o Render gerar (ex.: `https://gravador-de-tela-api.onrender.com`) e confirme que `https://<sua-url>/health` responde `{"status":"ok"}`.

> No plano free, o serviço "dorme" após 15 min sem tráfego e leva de 30 a 60s para acordar na primeira requisição seguinte — comportamento esperado do tier gratuito, não um bug.

**3. Frontend (Vercel, ~2 min)**

1. Importe o repositório na Vercel com **Root Directory** = `frontend`.
2. Build command: `npm run build` · Output directory: `dist` (a Vercel geralmente detecta isso sozinha por ser um projeto Vite).
3. Em Environment Variables, adicione `VITE_API_URL` com a URL do Render (passo 2.5).
4. Deploy. Depois, volte ao Render e atualize `CORS_ORIGIN` com a URL final da Vercel, se ainda não tiver feito.

### Alternativas

- **Backend**: Railway funciona da mesma forma (sem `render.yaml`, mas o `Dockerfile` incluso cobre esse caso). Diferença prática: Railway não "dorme", mas o crédito gratuito expira depois de um tempo.
- **Banco**: Supabase é equivalente ao Neon (também tem tier gratuito permanente), mas pausa projetos após 7 dias de inatividade — pior para um link de portfólio que fica parado entre visitas.
- **Armazenamento em nuvem** (opcional, só se for ativar sincronização/backup de vídeo): Cloudflare R2, Backblaze B2 ou AWS S3 — preencha as variáveis `S3_*` em `backend/.env.example`.

**Checklist mínimo do que só você pode fazer** (contas de terceiros exigem login humano — não consigo criá-las por você):

1. Criar a conta e o projeto no Neon, copiar a `DATABASE_URL`.
2. Criar o Web Service no Render via Blueprint, colar `DATABASE_URL`/`JWT_SECRET`/`CORS_ORIGIN`.
3. Importar o projeto na Vercel, colar `VITE_API_URL`.

Sem esses três passos, a aplicação já funciona perfeitamente como ferramenta 100% local — que é, aliás, o caso de uso principal.

## Compatibilidade

Ver a página `/compatibilidade` da própria aplicação para o painel ao vivo e a matriz comparativa. Resumo:

| Recurso | Chrome/Edge | Firefox | Safari |
|---|---|---|---|
| Gravação de tela | ✓ | ✓ | ✓ |
| Áudio do sistema | Parcial (Windows/Linux) | Parcial | Não |
| Webcam/microfone | ✓ | ✓ | ✓ |
| Pausar/retomar | ✓ | ✓ | Parcial (versões recentes) |

A gravação de tela **exige HTTPS ou `localhost`** — é uma exigência de segurança do próprio navegador, não uma limitação desta aplicação.

## Privacidade

- A tela nunca é enviada a um servidor durante a gravação — a captura e a codificação acontecem inteiramente no navegador.
- O microfone e a webcam só são usados após permissão explícita do sistema operacional/navegador.
- Por padrão, as gravações ficam apenas no IndexedDB do seu navegador.
- Se a sincronização com conta for ativada, o vídeo finalizado (não um stream ao vivo) é enviado ao backend — e isso é sempre uma ação explícita do usuário, nunca automática.

## Segurança

- Senhas com hash `bcrypt` (12 rounds); nunca armazenadas em texto puro.
- Autenticação via JWT assinado, validado em toda rota protegida.
- Validação de entrada com Zod em toda rota que recebe payload.
- Rate limiting nas rotas de login/registro.
- CORS restrito à origem configurada.
- Cabeçalhos de segurança via `helmet`.
- Verificação de MIME type no upload de vídeo (nunca confia apenas na extensão/Content-Type declarado pelo cliente).
- Limite de tamanho de upload configurável.
- Toda query ao PostgreSQL é parametrizada — sem concatenação de string, sem risco de SQL injection.
- Nenhum segredo commitado — tudo via variáveis de ambiente (`.env.example` documentam o que é necessário).

## Limitações conhecidas

- A gravação de tela requer HTTPS ou `localhost`.
- O suporte a áudio do sistema depende do navegador e do sistema operacional, e pode simplesmente não estar disponível — a aplicação avisa isso no momento certo, nunca finge que vai funcionar.
- Não é possível pré-selecionar programaticamente "aba" em vez de "tela"; a escolha final é sempre do usuário, na janela nativa do navegador.
- O formato final do vídeo (WebM ou MP4) depende dos codecs disponíveis no navegador de quem grava.
- A capacidade de armazenamento local (IndexedDB) varia por navegador e dispositivo — não existe um limite universal fixo.
- Em disco local (sem S3 configurado), o backend não escala horizontalmente (múltiplas instâncias não compartilham o disco).

## Decisões arquiteturais

- **Por que o backend é opcional, e não obrigatório**: gravar tela é uma operação inteiramente client-side por design de segurança do navegador — nenhum backend "recebe" a gravação em tempo real. Forçar um backend nesse ponto seria teatro de arquitetura. O backend existe para o que genuinamente precisa de um servidor: contas, sincronização entre dispositivos e compartilhamento — por isso a sincronização de metadados e o upload de vídeo são ações explícitas do usuário, não um passo obrigatório do fluxo de gravação.
- **Por que `pg` em vez de um ORM como Prisma**: ORMs modernos com engines pré-compiladas (Prisma, por exemplo) dependem de baixar binários nativos de um servidor de distribuição próprio no momento da instalação/geração do client. Isso funciona bem na maioria dos ambientes de produção, mas introduz uma dependência de rede externa que preferi evitar para um projeto de portfólio que deve rodar com o mínimo de fricção possível em qualquer ambiente (incluindo ambientes com rede restrita). `pg` é o driver oficial, SQL puro e explícito, com migrations versionadas via `node-pg-migrate` (JavaScript puro, sem binários).
- **Por que armazenamento local por padrão**: a maioria de quem usa uma ferramenta de gravação de tela quer gravar e usar na hora — exigir conta e upload antes de conseguir ver o próprio vídeo seria fricção desnecessária. IndexedDB resolve isso sem nenhuma configuração externa.
- **Por que a composição de webcam usa `<canvas>` em vez de duas gravações separadas**: gerar um único arquivo de vídeo já com a webcam sobreposta é o que a maioria das pessoas realmente quer ao compartilhar a gravação depois — evita ter que editar dois arquivos depois.

## Próximos passos

Ideias fora do escopo desta entrega, mas que fariam sentido como evolução:

- Edição básica (corte/trim) antes do download, usando o mesmo pipeline de canvas já existente.
- Transcrição automática (poderia usar a Web Speech API como primeira versão, sem depender de um serviço externo).
- Anotações/desenho sobre a tela durante a gravação.
- Modo "apresentação" com destaque de cursor e zoom automático em cliques.
