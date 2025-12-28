CREATE UNIQUE INDEX unique_active_borrow
ON transactions (user_id, book_id)
WHERE status = 'borrowed';

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_book ON transactions(book_id);
