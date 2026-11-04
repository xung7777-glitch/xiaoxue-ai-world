CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
