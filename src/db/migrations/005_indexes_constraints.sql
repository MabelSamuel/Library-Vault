CREATE UNIQUE INDEX unique_active_borrow
ON book_transaction (user_id, book_id)
WHERE status = 'borrowed';

CREATE INDEX idx_transaction_user ON book_transaction(user_id);
CREATE INDEX idx_transaction_book ON book_transaction(book_id);
