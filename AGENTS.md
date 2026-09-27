# AGENTS.md

## Tentang Project
Real-time collaborative whiteboard, monorepo (npm workspaces).
Baca docs/PRD-Collaborative-Whiteboard.md dan docs/ERD-dan-Arsitektur-WebSocket-Whiteboard.md sebelum implementasi fitur baru.

## Struktur
- apps/client -> React + Vite + TypeScript + Konva
- apps/server -> Node.js + Express + ws + Yjs
- packages/shared -> tipe data yang dipakai bareng client & server

## Aturan Coding
- Pakai TypeScript strict mode
- Ikuti pola feature-based folder di client (lihat docs/Struktur-Folder-Whiteboard.md)
- Ikuti pola modular monolith di server (controller -> service -> repository)
- Jangan install package baru tanpa disebutkan alasannya