CREATE TYPE role_type AS ENUM (
  'super_admin',
  'admin',
  'librarian',
  'member'
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name role_type UNIQUE NOT NULL
);