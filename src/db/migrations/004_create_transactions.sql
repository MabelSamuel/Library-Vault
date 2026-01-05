DROP TABLE IF EXISTS book_transaction CASCADE;

CREATE TYPE transaction_status AS ENUM ('borrowed', 'returned');

CREATE TABLE book_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES lib_user(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES book(id) ON DELETE CASCADE,
  status transaction_status NOT NULL DEFAULT 'borrowed',
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  returned_at TIMESTAMP,
  due_at TIMESTAMP
);