# Product Requirements Document (PRD)
# Real-time Collaborative Whiteboard

**Versi:** 1.0
**Tanggal:** 27 September 2026
**Status:** Draft — Portfolio Project

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Tim remote/hybrid butuh media kolaborasi visual real-time untuk brainstorming, wireframing, diagram alur kerja, dan workshop online — tanpa harus install software berat atau bergantung pada tools berbayar seperti Figma/Miro/FigJam. Produk seperti ini juga jadi salah satu use case paling menantang di dunia frontend engineering karena menggabungkan rendering grafis performa tinggi dengan sinkronisasi data multi-user secara real-time.

### 1.2 Tujuan Produk
- Menyediakan kanvas kolaboratif yang bisa diakses banyak orang sekaligus secara real-time tanpa delay terasa.
- Memastikan tidak ada data yang hilang/konflik ketika beberapa user mengedit objek yang sama secara bersamaan.
- Menjadi portfolio project yang menunjukkan kemampuan menangani real-time system, data structure untuk graphic editor, dan concurrency handling — bukan sekadar CRUD atau UI statis.

### 1.3 Target Pengguna (Persona)
| Persona | Kebutuhan Utama |
|---|---|
| **Facilitator/Host** | Membuat room, mengatur akses, memandu sesi (misal workshop/brainstorming) |
| **Kolaborator/Participant** | Menggambar, menambah elemen, komentar, melihat kursor peserta lain |
| **Viewer (read-only)** | Melihat progress board tanpa bisa mengedit (misal stakeholder yang hanya observasi) |

---

## 2. Scope Produk

### 2.1 In-Scope (MVP)
1. Kanvas interaktif: shape (rectangle, circle, line, arrow), teks, freehand drawing
2. Operasi dasar objek: drag, resize, rotate, delete, duplicate, ubah warna
3. Multi-select & group objek
4. Real-time sync antar user (perubahan objek langsung terlihat semua peserta)
5. Live cursor: menampilkan posisi & nama kursor peserta lain
6. Room-based collaboration (buat/join room via link)
7. Undo/redo (per user maupun global)
8. Zoom & pan kanvas

### 2.2 In-Scope (Advanced/Fase 2)
1. Sticky notes ala Miro (drag, warna-warni, buat brainstorming)
2. Comment thread pada objek tertentu
3. Presence indicator (avatar peserta aktif, siapa sedang mengedit apa)
4. Export board ke PNG/PDF/JSON
5. Version history / snapshot board (bisa rollback ke versi sebelumnya)
6. Template board siap pakai (kanban, mind map, retrospective)
7. Permission granular (host bisa lock objek tertentu, restrict edit area)
8. Voice chat terintegrasi (opsional, pakai WebRTC)

### 2.3 Out-of-Scope
- Real-time video conferencing penuh (fokus di whiteboard, bukan video call platform)
- Mobile native app (cukup web responsive)
- AI-assisted drawing/generation (opsional exploration di masa depan, bukan MVP)

---

## 3. User Stories & Fitur Detail

### 3.1 Modul Kanvas & Objek
- Sebagai User, saya bisa menambahkan shape (rectangle, circle, arrow, line) ke kanvas dengan klik-drag.
- Sebagai User, saya bisa menulis teks bebas dan mengedit ukuran/font-nya.
- Sebagai User, saya bisa menggambar bebas (freehand/pen tool) dengan ketebalan & warna garis yang bisa diatur.
- Sebagai User, saya bisa memilih banyak objek sekaligus (multi-select via drag-selection box) lalu memindahkan/menghapusnya bersamaan.
- Sebagai User, saya bisa melakukan zoom in/out dan pan kanvas tanpa memengaruhi posisi objek yang sebenarnya (transformasi viewport, bukan mengubah data objek).

### 3.2 Modul Real-time Collaboration (Inti Project)
- Sebagai User, ketika saya menggambar/memindahkan objek, semua peserta lain di room yang sama melihat perubahan itu dalam hitungan milidetik.
- Sebagai User, saya bisa melihat kursor peserta lain bergerak real-time, lengkap dengan nama/warna unik per peserta.
- Sebagai User, ketika dua orang mengedit objek yang sama secara bersamaan (misal sama-sama menggeser satu shape), sistem harus menghasilkan state akhir yang konsisten di semua device tanpa data hilang atau "flicker".
- Sebagai User, jika koneksi saya terputus sementara lalu tersambung lagi, board saya otomatis sinkron ke state terbaru tanpa reload manual.

**Ini bagian paling krusial untuk dijelaskan ke recruiter** — lihat Section 5 (Rancangan Teknis) untuk detail pendekatan CRDT.

### 3.3 Modul Room & Akses
- Sebagai Host, saya bisa membuat room baru dan mendapatkan link unik untuk dibagikan.
- Sebagai Host, saya bisa mengatur role peserta (editor/viewer) dan mengeluarkan peserta dari room.
- Sebagai Participant, saya bisa join room via link tanpa harus registrasi penuh (guest mode dengan nama sementara), atau login untuk akses penuh.

### 3.4 Modul Undo/Redo
- Sebagai User, saya bisa undo/redo aksi saya sendiri tanpa mengganggu histori aksi peserta lain (per-user undo stack, bukan global stack naif).
- Sistem harus menangani kasus: User A undo aksinya sendiri, padahal setelah aksi itu User B sudah menambahkan objek baru yang bergantung padanya (misal children shape dalam group).

### 3.5 Modul Presence & Awareness
- Sebagai User, saya bisa melihat daftar siapa saja yang sedang aktif di room (avatar list).
- Sebagai User, saya bisa melihat highlight/border berbeda warna pada objek yang sedang di-drag oleh user lain (mencegah dua orang tanpa sadar menabrak edit yang sama).

---

## 4. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Latency** | Perubahan objek terlihat di device peserta lain dalam < 150ms (kondisi jaringan normal) |
| **Konsistensi Data** | Semua peserta harus konvergen ke state akhir yang sama meski urutan pesan berbeda-beda (eventual consistency via CRDT) |
| **Skalabilitas** | Satu room mampu menampung minimal 20 peserta aktif bersamaan tanpa penurunan performa signifikan |
| **Recovery** | Jika server/koneksi terputus, client harus bisa re-sync otomatis tanpa kehilangan perubahan lokal yang belum terkirim |
| **Performa Rendering** | Kanvas tetap responsif (≥ 30fps) meski berisi ratusan objek |
| **Persistensi** | Board tersimpan otomatis (auto-save) sehingga tidak hilang saat semua peserta keluar |

---

## 5. Rancangan Teknis (Rekomendasi)

### 5.1 Tech Stack
- **Frontend:** React + Konva.js (canvas rendering library berbasis React, lebih mudah dari raw Canvas API) atau Fabric.js sebagai alternatif
- **Real-time sync engine:** Yjs (library CRDT paling matang untuk kolaborasi real-time)
- **Transport layer:** WebSocket (Socket.io atau y-websocket, provider resmi dari Yjs)
- **Backend:** Node.js (untuk WebSocket server & persistence layer)
- **Database:** PostgreSQL (metadata room, user, permission) + object storage untuk snapshot board (bisa disimpan sebagai binary Yjs document)
- **Auth:** JWT untuk user terdaftar, token sementara untuk guest mode

### 5.2 Kenapa CRDT (Yjs), Bukan Operational Transformation (OT)?
Ini poin yang wajib dipahami & bisa dijelaskan saat interview:

| Aspek | OT (Operational Transformation) | CRDT (Conflict-free Replicated Data Type) |
|---|---|---|
| Kebutuhan server pusat | Ya, perlu central server untuk transform operasi secara berurutan | Tidak wajib — bisa peer-to-peer, server hanya relay |
| Kompleksitas implementasi | Tinggi — algoritma transform harus benar untuk semua kombinasi operasi | Library seperti Yjs sudah menghandle logic konvergensi |
| Offline support | Sulit — butuh operasi berurutan dari server | Natural — setiap client bisa edit offline, sync belakangan |
| Skalabilitas | Server jadi bottleneck | Lebih mudah didistribusikan |

**Kesimpulan desain:** Yjs dipilih karena mengimplementasikan struktur data CRDT (`Y.Map`, `Y.Array`) yang secara otomatis menyelesaikan konflik edit bersamaan tanpa perlu menulis algoritma transformasi sendiri — objek kanvas (shape, posisi, warna) direpresentasikan sebagai shared `Y.Map`, dan setiap perubahan lokal otomatis di-broadcast serta digabungkan (merge) secara matematis konsisten di semua client.

### 5.3 Alur Data Real-time

```
User A menggambar shape baru
   ↓
Perubahan ditulis ke Y.Doc lokal (CRDT document)
   ↓
Yjs generate "update" (binary diff, bukan seluruh state)
   ↓
Update dikirim via WebSocket ke server relay
   ↓
Server broadcast update ke semua client lain di room yang sama
   ↓
Client lain menerima update → apply ke Y.Doc lokal masing-masing
   ↓
Y.Doc trigger event → React re-render kanvas dengan state terbaru
```

### 5.4 Struktur Data Objek Kanvas (dalam Y.Doc)
```typescript
// Shared document structure
interface WhiteboardObject {
  id: string;              // UUID unik per objek
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'freehand';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];       // untuk freehand/line
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  zIndex: number;
  groupId?: string;        // jika bagian dari grouping
  createdBy: string;       // user id
  lastModifiedBy: string;
  updatedAt: number;
}

// Disimpan sebagai Y.Map di dalam Y.Map utama (objects), key = object.id
// yDoc.getMap('objects').set(object.id, new Y.Map(Object.entries(object)))
```

### 5.5 Presence & Live Cursor (Awareness Protocol)
Yjs menyediakan modul terpisah bernama **Awareness** khusus untuk data sementara yang tidak perlu persisten (posisi kursor, siapa sedang online, siapa sedang edit apa) — berbeda dari `Y.Doc` yang untuk data permanen board.

```typescript
// Update posisi kursor lokal, di-broadcast otomatis ke semua peer
awareness.setLocalStateField('cursor', { x: mouseX, y: mouseY, name: userName, color: userColor });

// Render kursor peserta lain
awareness.getStates().forEach((state, clientId) => {
  if (state.cursor) renderRemoteCursor(state.cursor, clientId);
});
```

### 5.6 Undo/Redo per User
Yjs menyediakan `UndoManager` yang bisa di-scope ke origin tertentu (misal per client ID), sehingga undo satu user tidak menghapus perubahan user lain yang terjadi di antaranya:
```typescript
const undoManager = new Y.UndoManager(yDoc.getMap('objects'), {
  trackedOrigins: new Set([localClientId]),
});
```

---

## 6. Roadmap Pengerjaan (untuk Portfolio)

| Fase | Fitur | Estimasi Waktu |
|---|---|---|
| **Fase 1** | Setup kanvas dasar (shape, drag, resize) tanpa collaboration dulu | 1-2 minggu |
| **Fase 2** | Integrasi Yjs + WebSocket, sync objek antar 2 tab browser | 1-2 minggu |
| **Fase 3** | Live cursor, presence, awareness protocol | 3-5 hari |
| **Fase 4** | Room management, auth, persistence ke database | 1 minggu |
| **Fase 5** | Undo/redo per user, multi-select, grouping | 1 minggu |
| **Fase 6 (Advanced)** | Sticky notes, comment, export, version history | 1-2 minggu |

---

## 7. Metrik Keberhasilan (untuk Konteks Portfolio)
- Bisa didemokan live dengan 2+ browser tab/device berbeda mengedit board yang sama secara bersamaan tanpa bug visual.
- Ada test/demo skenario khusus: dua user menggeser shape yang sama di saat bersamaan → hasil akhir tetap konsisten di kedua layar.
- Ada dokumentasi arsitektur yang menjelaskan kenapa memilih CRDT dibanding OT (nilai plus besar saat interview teknis).
- Reconnection test: matikan koneksi salah satu client, edit board dari sisi lain, sambungkan lagi → client yang reconnect otomatis sinkron.

---

## 8. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Kompleksitas CRDT sulit dipahami di awal | Mulai dari contoh resmi Yjs (y-websocket demo), pelajari step-by-step sebelum custom |
| Performa menurun saat objek sangat banyak | Terapkan virtualization/culling (hanya render objek yang terlihat di viewport) |
| WebSocket server jadi single point of failure | Untuk skala portfolio cukup 1 server, tapi dokumentasikan opsi scaling (Redis pub/sub untuk multi-server) sebagai talking point |
| Race condition saat auto-save ke database | Debounce auto-save, simpan snapshot Y.Doc sebagai binary secara periodik, bukan tiap keystroke |
| Scope terlalu besar untuk dikerjakan sendiri | Prioritaskan Fase 1-4 sebagai "harus selesai", Fase 5-6 opsional pemanis |

---

## 9. Diferensiasi (Kenapa Project Ini Bukan "Receh")

Poin ini penting untuk disebutkan di README/portfolio agar recruiter langsung paham nilai tekniknya:
- Bukan sekadar UI kanvas — melibatkan **distributed systems concept** (eventual consistency, conflict resolution) yang biasanya baru dipelajari di level menengah-senior.
- Menunjukkan pemahaman **data structure custom** untuk graphic editor (shape representation, spatial indexing untuk hit-testing saat multi-select).
- Real-time system dengan **WebSocket at scale**, bukan sekadar chat sederhana.
- Ada **trade-off desain yang bisa dijelaskan** (CRDT vs OT, awareness vs persistent data) — ini yang membedakan developer yang paham konsep vs yang cuma ikuti tutorial.
