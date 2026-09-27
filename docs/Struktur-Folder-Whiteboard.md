# Struktur Folder Project — Real-time Collaborative Whiteboard

**Versi:** 1.0
**Tanggal:** 27 September 2026

---

## 1. Pilihan Arsitektur: Monorepo

Karena project ini punya 2 bagian yang saling terkait erat (frontend kanvas + backend WebSocket server, keduanya sama-sama pakai library `yjs`), disarankan pakai **monorepo** (satu repository, dua package) daripada dua repo terpisah. Alasan:
- Tipe data (`WhiteboardObject`, event WebSocket) bisa di-share antara frontend & backend tanpa duplikasi kode.
- Gampang dijalankan bareng saat development (`npm run dev` jalanin client + server sekaligus).
- Satu repo lebih gampang di-showcase di GitHub sebagai satu project utuh.

**Tools:** npm workspaces (paling simpel, tidak perlu tool tambahan) atau Turborepo (kalau mau lebih niat dengan build caching).

---

## 2. Struktur Folder Level Atas

```
collaborative-whiteboard/
├── apps/
│   ├── client/                 # Frontend React app
│   └── server/                 # Backend WebSocket + REST API
├── packages/
│   └── shared/                 # Tipe data & konstanta yang dipakai client & server
├── docs/                       # PRD, ERD, arsitektur (dokumen yang sudah dibuat)
├── docker-compose.yml          # Postgres + Redis untuk local development
├── .env.example
├── .gitignore
├── package.json                # root, isi workspaces config
├── turbo.json                  # jika pakai Turborepo
└── README.md
```

---

## 3. Detail `apps/client/` (Frontend)

```
apps/client/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                          # entry point
│   ├── App.tsx
│   │
│   ├── features/
│   │   ├── canvas/
│   │   │   ├── components/
│   │   │   │   ├── CanvasStage.tsx        # wrapper utama Konva Stage
│   │   │   │   ├── ShapeRenderer.tsx      # render tiap objek berdasarkan type
│   │   │   │   ├── SelectionBox.tsx       # drag-selection multi-select
│   │   │   │   ├── Toolbar.tsx            # pilih tool: rectangle, pen, text, dll
│   │   │   │   └── ZoomControls.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCanvasObjects.ts    # baca/tulis ke Y.Map('objects')
│   │   │   │   ├── useDragObject.ts
│   │   │   │   ├── useSelection.ts
│   │   │   │   └── useUndoRedo.ts         # wrapper Y.UndoManager
│   │   │   └── utils/
│   │   │       ├── shapeFactory.ts        # bikin objek shape baru dengan default props
│   │   │       └── hitTest.ts             # deteksi objek mana yang diklik
│   │   │
│   │   ├── collaboration/
│   │   │   ├── components/
│   │   │   │   ├── RemoteCursor.tsx       # render kursor user lain
│   │   │   │   ├── PresenceAvatars.tsx    # daftar avatar user aktif
│   │   │   │   └── ConnectionStatus.tsx   # indikator online/reconnecting
│   │   │   ├── hooks/
│   │   │   │   ├── useYDoc.ts             # setup Y.Doc + WebsocketProvider
│   │   │   │   ├── useAwareness.ts        # sinkronisasi cursor & presence
│   │   │   │   └── useRoomConnection.ts
│   │   │   └── providers/
│   │   │       └── YjsProvider.tsx        # React Context, bungkus Y.Doc utk seluruh app
│   │   │
│   │   ├── room/
│   │   │   ├── components/
│   │   │   │   ├── RoomLobby.tsx          # halaman buat/join room
│   │   │   │   ├── ShareRoomModal.tsx
│   │   │   │   └── RoomSettingsPanel.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useRoomPermission.ts
│   │   │   └── api/
│   │   │       └── roomApi.ts             # REST call: create room, get invite link
│   │   │
│   │   ├── comments/                       # fase 2
│   │   │   ├── components/
│   │   │   │   └── CommentThread.tsx
│   │   │   └── hooks/
│   │   │       └── useComments.ts
│   │   │
│   │   └── auth/
│   │       ├── components/
│   │       │   └── LoginForm.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       └── api/
│   │           └── authApi.ts
│   │
│   ├── components/                         # komponen UI generik, dipakai lintas fitur
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Tooltip.tsx
│   │   └── layout/
│   │       └── AppShell.tsx
│   │
│   ├── lib/
│   │   ├── apiClient.ts                    # axios/fetch wrapper untuk REST API
│   │   └── websocketClient.ts              # konfigurasi koneksi WS dasar
│   │
│   ├── stores/                             # state management non-Yjs (misal Zustand)
│   │   ├── useToolStore.ts                 # tool yang lagi aktif dipilih user
│   │   └── useUIStore.ts                   # modal terbuka, sidebar, dll
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── types/
│       └── canvas.types.ts                 # tipe lokal frontend (jika tidak dari shared)
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .eslintrc.cjs
```

**Catatan penataan `features/`:** Struktur ini pakai pola **feature-based folder** (bukan pisah berdasarkan tipe file seperti `/components`, `/hooks` semua digabung jadi satu folder besar). Ini penting disebutkan di README karena menunjukkan kamu paham cara mengatur skala aplikasi frontend yang lebih besar — tiap fitur (canvas, collaboration, room) self-contained dan gampang di-maintain terpisah.

---

## 4. Detail `apps/server/` (Backend)

```
apps/server/
├── src/
│   ├── index.ts                            # entry point, start HTTP + WS server
│   │
│   ├── websocket/
│   │   ├── wsServer.ts                     # setup WebSocket server & upgrade handler
│   │   ├── connectionHandler.ts            # logic saat client connect ke room
│   │   ├── docManager.ts                   # in-memory Map<roomId, Y.Doc>, get-or-create
│   │   └── redisSync.ts                    # pub/sub multi-server (opsional, fase lanjut)
│   │
│   ├── modules/
│   │   ├── room/
│   │   │   ├── room.controller.ts          # REST endpoint: POST /rooms, GET /rooms/:id
│   │   │   ├── room.service.ts             # business logic: create, check permission
│   │   │   ├── room.repository.ts          # query ke Postgres
│   │   │   └── room.routes.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts             # hash password, generate JWT
│   │   │   ├── auth.middleware.ts          # verifikasi token di REST & WS upgrade
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── snapshot/
│   │   │   ├── snapshot.service.ts         # save/load Y.Doc binary ke/dari Postgres
│   │   │   └── snapshot.repository.ts
│   │   │
│   │   ├── comments/                        # fase 2
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   └── comments.routes.ts
│   │   │
│   │   └── users/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── users.repository.ts
│   │
│   ├── db/
│   │   ├── client.ts                       # koneksi Postgres (pg / Prisma / Drizzle)
│   │   ├── migrations/
│   │   │   ├── 0001_create_users.sql
│   │   │   ├── 0002_create_rooms.sql
│   │   │   ├── 0003_create_room_members.sql
│   │   │   ├── 0004_create_board_snapshots.sql
│   │   │   └── 0005_create_comments.sql
│   │   └── seed.ts                         # data dummy untuk development
│   │
│   ├── jobs/
│   │   ├── autoSaveJob.ts                  # debounced snapshot save
│   │   └── roomCleanupJob.ts               # unload Y.Doc dari memory jika tidak aktif
│   │
│   ├── config/
│   │   ├── env.ts                          # validasi & load environment variables
│   │   └── constants.ts
│   │
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   │
│   └── utils/
│       ├── logger.ts
│       └── jwt.ts
│
├── tests/
│   ├── unit/
│   │   └── room.service.test.ts
│   └── integration/
│       └── websocket-sync.test.ts          # test skenario 2 client edit bersamaan
│
├── tsconfig.json
├── package.json
└── .env.example
```

**Catatan penataan `modules/`:** Pola ini disebut **modular monolith** — tiap modul (room, auth, snapshot) py struktur konsisten (controller → service → repository), gampang dipisah jadi microservice terpisah nanti kalau perlu scale, tapi untuk portfolio tetap simpel dijalankan sebagai satu aplikasi.

---

## 5. Detail `packages/shared/`

Ini folder kunci yang bikin monorepo ini worth-it — tipe data didefinisikan sekali, dipakai baik di client maupun server supaya tidak ada mismatch schema.

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── whiteboard-object.types.ts     # interface WhiteboardObject (shape, dll)
│   │   ├── room.types.ts                  # Room, RoomMember, RoomRole
│   │   ├── websocket-events.types.ts      # enum/union tipe event WS (cursor-move, dll)
│   │   └── user.types.ts
│   ├── constants/
│   │   └── canvas.constants.ts            # default warna, ukuran, batas zoom
│   └── index.ts                            # re-export semua
├── tsconfig.json
└── package.json
```

Contoh isi yang di-share:
```typescript
// packages/shared/src/types/whiteboard-object.types.ts
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'freehand';

export interface WhiteboardObject {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  zIndex: number;
  groupId?: string;
  createdBy: string;
  lastModifiedBy: string;
  updatedAt: number;
}
```
Baik `apps/client` maupun `apps/server` tinggal `import { WhiteboardObject } from '@whiteboard/shared'`.

---

## 6. Folder `docs/`

```
docs/
├── PRD-Collaborative-Whiteboard.md
├── ERD-dan-Arsitektur-WebSocket-Whiteboard.md
├── STRUKTUR-FOLDER.md                      # dokumen ini
├── API-CONTRACT.md                         # (dibuat menyusul, kalau lanjut)
└── architecture-diagram.png
```

Menyimpan dokumen perencanaan di dalam repo (bukan cuma di local/Google Docs) itu nilai plus tersendiri — recruiter yang buka repo GitHub kamu langsung lihat kamu punya proses berpikir yang terdokumentasi, bukan cuma "ngoding asal jalan".

---

## 7. Root `package.json` (npm workspaces)

```json
{
  "name": "collaborative-whiteboard",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/server\" \"npm run dev -w apps/client\"",
    "build": "npm run build -w packages/shared && npm run build -w apps/server && npm run build -w apps/client",
    "docker:up": "docker-compose up -d",
    "test": "npm run test -w apps/server"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

## 8. `docker-compose.yml` (Development Environment)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: whiteboard_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 9. Alasan Struktur Ini Dipilih (untuk README/interview)

| Keputusan | Alasan |
|---|---|
| Monorepo, bukan repo terpisah | Type-safety terjaga antara client-server, satu sumber kebenaran untuk struktur data objek kanvas |
| Feature-based folder di frontend | Skala lebih baik dibanding folder generik (`components/`, `hooks/` semua campur), tiap fitur self-contained |
| Modular monolith di backend | Siap dipecah jadi microservice nanti, tapi tetap simpel untuk dijalankan & dites sebagai portfolio project |
| `packages/shared` terpisah | Mencegah duplikasi definisi tipe data, mengurangi bug akibat schema mismatch client-server |
| `docs/` masuk dalam repo | Transparansi proses desain, jadi nilai tambah saat direview recruiter/interviewer |

---

## 10. Urutan Setup Project (Langkah Awal)

```bash
mkdir collaborative-whiteboard && cd collaborative-whiteboard
npm init -y
mkdir -p apps/client apps/server packages/shared docs

# Setup workspaces di root package.json (lihat Section 7)

# Init client (Vite + React + TS)
npm create vite@latest apps/client -- --template react-ts

# Init server (Node + TS)
cd apps/server && npm init -y && npm install express ws yjs y-websocket pg ioredis
cd ../..

# Init shared package
cd packages/shared && npm init -y
cd ../..

# Jalankan Postgres & Redis lokal
docker-compose up -d
```
