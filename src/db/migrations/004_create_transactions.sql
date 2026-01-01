DROP TABLE IF EXISTS transactions CASCADE;

CREATE TYPE transaction_status AS ENUM ('borrowed', 'returned');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status transaction_status NOT NULL DEFAULT 'borrowed',
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  returned_at TIMESTAMP
);