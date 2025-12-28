CREATE TYPE role_type AS ENUM ('super_admin', 'admin', 'librarian', 'member');

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name role_type UNIQUE NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  token_version INTEGER DEFAULT 0,
  role role_type NOT NULL DEFAULT 'member'
);

CREATE TABLE role_permissions (
  role role_type REFERENCES roles(name),
  permission VARCHAR(50),
  PRIMARY KEY(role, permission)
);

INSERT INTO roles (name) VALUES ('super_admin'), ('admin'), ('librarian'), ('member');

INSERT INTO role_permissions (role, permission) VALUES
('super_admin', 'manage_users'),
('super_admin', 'manage_books'),
('admin', 'manage_librarians'),
('librarian', 'issue_books'),
('member', 'borrow_books');

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE transaction_status AS ENUM ('borrowed', 'returned');

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status transaction_status NOT NULL DEFAULT 'borrowed',
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  returned_at TIMESTAMP
);

CREATE UNIQUE INDEX unique_active_borrow
ON transactions (user_id, book_id)
WHERE status = 'borrowed';

ALTER TABLE transactions ADD COLUMN due_at TIMESTAMP;

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  target_table VARCHAR(50),
  target_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);