-- Neon 콘솔의 SQL Editor에서 한 번 실행 (docs/PRD-collection-game.md 8절 참고)
CREATE TABLE IF NOT EXISTS players (
  nickname TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  slot1 TEXT,
  slot2 TEXT,
  slot3 TEXT,
  slot4 TEXT,
  slot5 TEXT,
  slot6 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
