# AGENTS.md

Dokumen ini adalah instruksi standing untuk AI coding agent (OpenCode, Claude Code, atau tools sejenis) yang bekerja di repository ini. Baca ini di awal setiap sesi sebelum melakukan perubahan apapun.

---

## 1. Tentang Project

**Nama:** Real-time Collaborative Whiteboard
**Deskripsi singkat:** Aplikasi web kanvas kolaboratif real-time (mirip mini Figma/Miro) di mana banyak user bisa menggambar, menambah shape, dan mengedit board yang sama secara bersamaan tanpa konflik data.

**Dokumen referensi wajib dibaca sebelum implementasi fitur baru:**
- `docs/PRD-Collaborative-Whiteboard.md` — requirement produk, user stories, scope MVP vs advanced
- `docs/ERD-dan-Arsitektur-WebSocket-Whiteboard.md` — skema database, struktur Y.Doc, arsitektur WebSocket server
- `docs/Struktur-Folder-Whiteboard.md` — konvensi struktur folder & alasan desainnya

**Jangan mulai coding fitur apapun tanpa membaca bagian relevan dari dokumen di atas terlebih dahulu.** Kalau ada instruksi yang bertentangan antara prompt user dan dokumen ini, tanyakan ke user dulu, jangan asumsi sendiri.

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + TypeScript |
| Rendering kanvas | Konva.js (`react-konva`) |
| Real-time sync | Yjs (CRDT) + y-websocket |
| Backend | Node.js + Express + `ws` |
| Database | PostgreSQL |
| Cache/pub-sub | Redis (opsional, untuk multi-server scaling — belum wajib di MVP) |
| Linter | ESLint (+ `eslint-plugin-react-hooks` wajib aktif) |
| Package manager | npm (workspaces) |

Jangan mengganti library inti (Konva, Yjs, dsb) dengan alternatif lain tanpa konfirmasi ke user — pemilihan ini sudah didasarkan pada pertimbangan di `docs/ERD-dan-Arsitektur-WebSocket-Whiteboard.md` Section 5.2.

---

## 3. Struktur Folder

Monorepo dengan npm workspaces:
```
apps/client/     -> Frontend React (feature-based folder: features/canvas, features/collaboration, features/room, dst)
apps/server/     -> Backend (modular monolith: modules/room, modules/auth, modules/snapshot, dst)
packages/shared/ -> Tipe data & konstanta yang dipakai bareng client & server
docs/            -> Dokumen perencanaan (PRD, ERD, dsb)
```

**Aturan penempatan file:**
- Komponen React baru untuk fitur kanvas → `apps/client/src/features/canvas/components/`
- Komponen React baru untuk fitur real-time/presence → `apps/client/src/features/collaboration/components/`
- Custom hook → folder `hooks/` di dalam feature yang sesuai, bukan folder hooks global kecuali benar-benar generik lintas fitur
- Tipe data yang dipakai baik di client maupun server → WAJIB taruh di `packages/shared/src/types/`, jangan duplikasi definisi di kedua tempat
- Endpoint REST baru di backend → ikuti pola `modules/<nama-modul>/`: `*.controller.ts` → `*.service.ts` → `*.repository.ts`

Rujuk `docs/Struktur-Folder-Whiteboard.md` untuk detail lengkap sebelum membuat folder/file baru di luar pola yang sudah ada.

---

## 4. Aturan Coding

### Umum
- TypeScript strict mode wajib aktif (`strict: true` di `tsconfig.json`), jangan pernah pakai `any` kecuali benar-benar tidak ada pilihan lain — kalau terpaksa, kasih komentar alasan di sebelahnya.
- Semua tipe object kanvas (shape, dsb) HARUS mengacu ke `packages/shared/src/types/whiteboard-object.types.ts`, jangan bikin interface duplikat di file lain.
- Penamaan file komponen React: `PascalCase.tsx`. Hook: `camelCase.ts` diawali `use`.
- Fungsi async selalu pakai `async/await`, hindari `.then()` chaining kecuali di kasus tertentu yang memang lebih jelas dengan chaining.

### Khusus Yjs / Real-time
- **Jangan pernah menyimpan objek kanvas langsung sebagai React state biasa (`useState`) untuk data yang perlu di-sync**. Semua data board harus lewat `Y.Map`/`Y.Array` di dalam `Y.Doc`, React hanya re-render berdasarkan event dari Yjs observer.
- Data sementara (posisi kursor, siapa sedang online) HARUS lewat **Awareness API**, bukan disimpan di `Y.Doc` utama — supaya snapshot board tidak membengkak dengan data yang tidak perlu persisten. Lihat `docs/ERD-dan-Arsitektur-WebSocket-Whiteboard.md` Section A.3.
- Kalau menambah field baru ke struktur objek kanvas, update dulu tipe di `packages/shared`, baru implementasi di client & server.
- Undo/redo harus di-scope per user (`trackedOrigins`), jangan bikin implementasi undo manual sendiri di luar `Y.UndoManager`.

### Backend
- Jangan tulis raw SQL langsung di controller — selalu lewat layer `repository`.
- Snapshot Y.Doc ke database harus di-debounce (lihat pola di `docs/ERD-dan-Arsitektur-WebSocket-Whiteboard.md` Section B.4), jangan save tiap kali ada perubahan kecil.
- Autentikasi WebSocket divalidasi SEBELUM upgrade koneksi (di level `server.on('upgrade', ...)`), bukan setelah koneksi terbentuk.

### Testing
- Setiap fitur yang berkaitan dengan sinkronisasi data (Yjs) harus punya minimal 1 test skenario "dua client edit bersamaan" di `apps/server/tests/integration/`.
- Jangan skip test yang sudah ada tanpa alasan yang dijelaskan ke user.

---

## 5. Alur Kerja yang Diharapkan

1. **Sebelum mulai fitur baru:** baca bagian relevan di `docs/`, konfirmasi pemahaman scope ke user kalau ambigu.
2. **Kerjakan dalam potongan kecil** (satu komponen/satu modul per sesi), jangan coba implementasi banyak fitur besar sekaligus dalam satu langkah.
3. **Jangan install package baru** tanpa menyebutkan ke user package apa dan kenapa dibutuhkan.
4. **Jangan ubah struktur folder** yang sudah ditetapkan di `docs/Struktur-Folder-Whiteboard.md` tanpa izin eksplisit.
5. **Setelah membuat/mengubah kode**, jalankan lint (`npm run lint` jika tersedia) sebelum menganggap task selesai.
6. **Commit message** singkat dan deskriptif dalam bahasa Inggris, format: `feat: add shape drag handler`, `fix: cursor sync race condition`, dsb (Conventional Commits).

---

## 6. Hal yang TIDAK Boleh Dilakukan

- Jangan commit folder `node_modules/`, `.env`, atau file build (`dist/`) — cek `.gitignore` sudah benar sebelum commit besar.
- Jangan hardcode URL/port server (misal `localhost:3001`) langsung di kode — gunakan environment variable (`.env` + `apps/server/src/config/env.ts`).
- Jangan implementasi custom conflict-resolution algorithm sendiri untuk menggantikan Yjs — itu di luar scope, gunakan API yang sudah disediakan Yjs.
- Jangan ubah `packages/shared` tanpa memastikan perubahan itu tidak merusak kode yang sudah memakainya di `apps/client` maupun `apps/server`.

---

## 7. Environment & Menjalankan Project

```bash
# Install semua dependency (dari root)
npm install

# Jalankan client + server bersamaan (dari root)
npm run dev

# Jalankan Postgres & Redis lokal
docker-compose up -d
```

Environment variable dibutuhkan di `apps/server/.env` (lihat `.env.example`):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whiteboard_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=<isi_manual>
PORT=3001
```

---

## 8. Kalau Ragu

Kalau instruksi dari user tidak jelas atau berpotensi bertentangan dengan arsitektur yang sudah didefinisikan di `docs/`, **tanyakan dulu** sebelum eksekusi, terutama untuk:
- Perubahan skema database
- Penambahan library/dependency baru
- Perubahan struktur folder inti
- Keputusan yang memengaruhi cara sinkronisasi data real-time