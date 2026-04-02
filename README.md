#  📚 LibraryVault API

LibraryVault API is a secure and scalable RESTful backend for managing library resources. It provides full CRUD functionality with role-based access control (RBAC), making it ideal for building modern library management systems with structured permissions and resource organization.

## About

LibraryVault is designed to simplify how libraries manage:

- Books & resources
- Users (students, librarians, admins)
- Authentication & authorization
- Permissions via roles (RBAC)

Whether you're building a school system, digital archive, or enterprise library platform, LibraryVault provides a solid backend foundation.

## Documentation

You can explore the full API documentation, endpoints, and usage examples here:

[LibraryVault Doc](https://library-vault-doc.vercel.app/)


## Why LibraryVault?

When building a library management UI, developers often run into a common problem — no ready-to-use backend with structured library data and authentication.

Most times, you either:

- Hardcode JSON files
- Use random mock data
- Or spend time building a backend before even testing your UI

LibraryVault solves this.

It provides a ready-to-use API that lets you:

- Work with realistic library data models (books, users, roles)
- Test authentication flows (login, register, refresh tokens)
- Simulate role-based access control (RBAC) in your UI
- Build and test full CRUD interfaces without setting up a backend
- Prototype faster with safe, non-critical data

## Base URL

```bash
http://localhost:8000/api/v1
```

## Authentication

LibraryVault uses JWT authentication with refresh tokens.

## Register

POST `/auth/register`

```
{
  "username": "mapleberry",
  "email": "mapleberry@example.com",
  "password": "password"
}
```
## Login

POST `/auth/login`
```
{
  "identifier": "mapleberry@example.com",
  "password": "StrongPassword123!"
}
```
Response:
```
{
  "accessToken": "your-access-token",
  "refreshToken": "your-refresh-token"
}
```
## Logout

POST `/auth/logout`

Invalidates the current session.

## Refresh Token

POST `/auth/refresh`
```
{
  "refreshToken": "your-refresh-token"
}
```

## Password Reset

POST `/auth/password-reset`
```
{
  "email": "mabel@example.com"
}
```

# Resources

LibraryVault is built around key library entities:

- Books
- Users
- Roles & Permissions
- Borrowing / Transactions (optional extension)
  
## Books
Fields
```
{
  "id": "number",
  "title": "string",
  "author": "string",
  "category": "string",
  "isbn": "string",
  "publishedYear": "number",
  "availableCopies": "number",
  "createdAt": "date"
}
```
Get All Books
```
fetch("http://localhost:8000/api/v1/books")
  .then(res => res.json())
  .then(data => console.log(data));
```
Get Single Book
```
fetch("http://localhost:8000/api/v1/books/1")
  .then(res => res.json())
  .then(data => console.log(data));
```
Add New Book
```
fetch("http://localhost:8000/api/v1/books", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-help",
    isbn: "1234567890",
    publishedYear: 2018,
    availableCopies: 5
  })
});
```
Update Book
```
fetch("http://localhost:8000/api/v1/books/1", {
  method: "PUT",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN"
  },
  body: JSON.stringify({
    title: "Updated Title"
  })
});
```
Delete Book
```
fetch("http://localhost:8000/api/v1/books/1", {
  method: "DELETE",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN"
  }
});
```

## Users
Fields
```
{
  "id": "number",
  "username": "string",
  "email": "string",
  "role": "string",
  "createdAt": "date"
}
```
Get All Users
```
GET /users
```
Get User by ID
```
GET /users/:id
```
Assign Role (Admin Only)
```
PATCH /users/:id/role
```

# Roles & Permissions (RBAC)

LibraryVault enforces access control using roles such as:

- Admin → Full access
- Librarian → Manage books & users
- Member → View & borrow books

Each endpoint is protected based on role permissions.

## Query Options

You can filter and sort results using query params:
```
/books?limit=10
/books?sort=desc
/books?category=fiction
```
Example Usage
```
// Get books with limit
fetch("{{DEV_BASE_URL}}/books?limit=5")
  .then(res => res.json())
  .then(data => console.log(data));
```

## Error Handling

Typical error response:
```
{
  "status": "error",
  "message": "Unauthorized access"
}
```
# Roadmap

- Pagination support
- Borrow/return system
- Analytics dashboard
- Multi-library support
- GraphQL support
  
🧑‍💻 Tech Stack
Backend: Node.js / Express 
Database: PostgreSQL
Auth: JWT + Refresh Tokens

# Contributing
Contributions are welcome! Feel free to fork the repo and submit a pull request.

# License

MIT License
