# Arquitetura — Gravador de Tela

Este documento detalha como as peças do projeto se conectam. Para instalação e uso, veja o [README](./README.md).

### Visão geral

```mermaid
flowchart LR
    subgraph Navegador
        UI[React app]
        Engine[RecordingEngine]
        IDB[(IndexedDB)]
        UI --> Engine
        Engine --> UI
        UI <--> IDB
    end

    subgraph Backend[Backend opcional]
        API[Express API]
        DB[(PostgreSQL)]
        Storage[(Storage: disco local ou S3)]
        API <--> DB
        API <--> Storage
    end

    UI -. "somente se sincronização estiver ativa" .-> API

    ScreenAPI[[getDisplayMedia]]
    MicAPI[[getUserMedia - microfone]]
    CamAPI[[getUserMedia - webcam]]

    ScreenAPI --> Engine
    MicAPI --> Engine
    CamAPI --> Engine
```

O vídeo gravado **nunca** trafega para o backend a menos que o usuário ative explicitamente a sincronização/backup em nuvem — e mesmo assim, o que trafega é o arquivo já finalizado, não um stream ao vivo da tela.

### Fluxo de gravação (cliente)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant UI as Interface
    participant E as RecordingEngine
    participant B as Navegador (APIs de mídia)

    U->>UI: Clica em "Iniciar gravação"
    UI->>E: prepare(opções)
    E->>B: getDisplayMedia()
    B-->>U: Diálogo nativo (tela/janela/aba)
    U-->>B: Confirma o que compartilhar
    B-->>E: MediaStream (tela)
    opt Microfone ativado
        E->>B: getUserMedia(áudio)
        B-->>E: MediaStream (mic)
    end
    opt Webcam ativada
        E->>B: getUserMedia(vídeo)
        B-->>E: MediaStream (webcam)
        E->>E: Compõe tela + webcam em <canvas>
    end
    E->>E: Mixa faixas de áudio (Web Audio API)
    E->>B: new MediaRecorder(stream composto)
    E->>UI: start() — status "recording"
    U->>UI: Pausar / Retomar / Finalizar
    UI->>E: pause() / resume() / stop()
    E-->>UI: Blob final (vídeo)
    UI->>UI: Gera thumbnail (frame do vídeo)
    UI->>IDB: Salva registro completo
```

### Modelo de dados (backend)

```mermaid
erDiagram
    users ||--o{ recordings : possui
    recordings ||--o{ share_links : gera

    users {
        uuid id PK
        text email
        text password_hash
        text name
        timestamptz created_at
    }
    recordings {
        uuid id PK
        uuid user_id FK
        text name
        integer duration_ms
        bigint size_bytes
        text mime_type
        text storage_key "nulo até haver backup em nuvem"
        timestamptz created_at
        timestamptz updated_at
    }
    share_links {
        uuid id PK
        uuid token
        uuid recording_id FK
        timestamptz created_at
        timestamptz expires_at
    }
```

