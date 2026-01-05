CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS lib_user CASCADE;

CREATE TABLE lib_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
   CHECK (
      email ~* '^[A-Za-z0-9]+([._%+-]?[A-Za-z0-9]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$'
    ),
  password VARCHAR(255) NOT NULL,
  role role_type NOT NULL DEFAULT 'member',
  token_version INTEGER DEFAULT 0,
  is_email_verified BOOLEAN DEFAULT FALSE,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);