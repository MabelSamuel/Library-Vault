CREATE TYPE role_type AS ENUM ('super_admin', 'admin', 'librarian', 'member');

CREATE TABLE lib_user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  token_version INTEGER DEFAULT 0,
  role role_type NOT NULL DEFAULT 'member'
);

CREATE TABLE role_permission (
  role role_type REFERENCES role(name),
  permission VARCHAR(50),
  PRIMARY KEY(role, permission)
);

INSERT INTO role (name) VALUES ('super_admin'), ('admin'), ('librarian'), ('member');

INSERT INTO role_permission (role, permission) VALUES
('super_admin', 'manage_users'),
('super_admin', 'manage_books'),
('admin', 'manage_librarians'),
('librarian', 'issue_books'),
('member', 'borrow_books');

CREATE TABLE book (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE transaction_status AS ENUM ('borrowed', 'returned');

CREATE TABLE book_transaction (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES lib_user(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE,
  status transaction_status NOT NULL DEFAULT 'borrowed',
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_at TIMESTAMP,
  returned_at TIMESTAMP
);

CREATE UNIQUE INDEX unique_active_borrow
ON book_transaction (user_id, book_id)
WHERE status = 'borrowed';

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES lib_user(id),
  action VARCHAR(100),
  target_table VARCHAR(50),
  target_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);