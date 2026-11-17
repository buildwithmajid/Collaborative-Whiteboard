import path from 'path';
import dotenv from 'dotenv';

// Resolve relative to this file so it works no matter which cwd the server is started from.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (see apps/server/.env.example)`);
  }
  return value;
}

function numberOr(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number, got "${raw}"`);
  }
  return parsed;
}

export const env = {
  PORT: numberOr('PORT', 3001),
  DATABASE_URL: required('DATABASE_URL'),
  // Debounce window and hard upper bound for board snapshots (ERD Section B.4).
  SNAPSHOT_DEBOUNCE_MS: numberOr('SNAPSHOT_DEBOUNCE_MS', 5_000),
  SNAPSHOT_MAX_WAIT_MS: numberOr('SNAPSHOT_MAX_WAIT_MS', 60_000),
} as const;
