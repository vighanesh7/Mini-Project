# 5-minute demo plan and viva answers

## Demo plan (about 5 minutes)

Before you start: MySQL running, `npm run dev` in `server`, `npm run dev` in `client`, MySQL Workbench open on `bookstore_inventory`.

1. **Dashboard (30 s)** – show the live counts; say they come from `GET /api/dashboard/stats`, which runs `count` and `sum` queries.
2. **Add a publisher (30 s)** – Publishers → Add. Try an empty name first to show validation.
3. **Add an author (30 s)** – choose that publisher in the dropdown (it is a one-to-many link: `Authors.publisherId`).
4. **Add a second author** (15 s) – same or another publisher.
5. **Create a book with two authors (45 s)** – tick both authors, save. Say: one transaction saves the book and two rows in `AuthorBooks`.
6. **Author details (30 s)** – open an author; the new book is listed (many-to-many).
7. **Stock (45 s)** – Inventory → change stock to 2 → badge turns "Low stock"; open *Low-stock report* (raw SQL); set stock to 0 → "Out of stock".
8. **Advanced search (30 s)** – Books page: filter by genre + author, sort by price (calls `/api/books/search`).
9. **Prove persistence (45 s)** – in Workbench run `SELECT * FROM Books;` and `SELECT * FROM AuthorBooks;`, or refresh the page / open the API URL in the browser.

## Viva questions and short answers

**Why Node.js and Express?** Node runs JavaScript on the server, so frontend and backend share one language. Express is a small, popular framework for routes and middleware.

**Why Sequelize?** It is an ORM: we work with JavaScript models instead of hand-written SQL, and it gives validation, associations, transactions and migrations. Values are parameterised, which helps prevent SQL injection.

**What are models and migrations?** A model describes a table in JavaScript (fields, types, validation). A migration is a versioned script that creates or changes the real table; it can be run (`migrate`) and undone (`migrate:undo`), so the schema is reproducible.

**What is a foreign key?** A column that stores the primary key of a row in another table and is enforced by the database. Here `Authors.publisherId` points to `Publishers.id`.

**What is a one-to-many relationship?** One row on one side relates to many on the other: one publisher has many authors; each author has one publisher.

**What is a many-to-many relationship?** Many rows on both sides relate to each other: an author writes many books and a book can have many authors.

**Why is the AuthorBooks junction table required?** A single column cannot hold many ids in a proper relational design. The junction table stores one row per (author, book) pair, and its composite primary key blocks duplicates.

**Difference between `hasMany`, `belongsTo`, `belongsToMany`?** `hasMany` is declared on the "one" side (Publisher has many Authors). `belongsTo` is declared on the side holding the foreign key (Author belongs to Publisher). `belongsToMany` is for many-to-many and needs a `through` table.

**What are REST APIs and CRUD?** REST uses HTTP methods on URLs: GET reads, POST creates, PUT/PATCH updates, DELETE removes. CRUD = Create, Read, Update, Delete.

**What is the purpose of raw SQL?** For queries that are awkward in the ORM, such as a report joining three tables with `GROUP_CONCAT`. We use it for `/api/books/low-stock` with bound `replacements`, never string concatenation.

**How do React hooks work?** Hooks are functions that let function components keep state (`useState`), run side effects (`useEffect`), read context (`useContext`), memoise values/functions (`useMemo`, `useCallback`) and hold mutable references (`useRef`). They must be called at the top level of a component.

**Why use `useEffect`?** To run code after render, such as fetching data when a page opens or when `page`/filters change. The cleanup function cancels stale requests.

**What does `useContext` do?** It lets any component read shared values from a Provider without passing props through every level. Here `AppContext` shares notifications and a refresh counter.

**How does Axios connect React to Express?** Axios sends HTTP requests to the API base URL (`VITE_API_BASE_URL`); Express routes them to controllers; the JSON reply comes back and React puts it in state.

**How does a React form update MySQL?** Submit → validate → Axios `POST/PUT` → Express validator → controller → Sequelize `create/update` → MySQL → JSON reply → React shows a message and reloads the list.

**How are duplicate ISBNs and invalid stock handled?** Validators reject bad values (stock must be a whole number ≥ 0) with 400. The controller checks for an existing ISBN and returns 409. The database also has a UNIQUE index on `isbn` and a CHECK `stock >= 0` as a last line of defence.
