CREATE TABLE IF NOT EXISTS board_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(255) NOT NULL,
  snapshot_data BYTEA NOT NULL,
  version_number INT NOT NULL,
  snapshot_type VARCHAR(20) NOT NULL DEFAULT 'auto',
  created_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_board_snapshots_room_id_version 
ON board_snapshots(room_id, version_number DESC);
