# Backend Technical Interview Task
**Stack:** Node.js, Express, PostgreSQL
**Time:** 4–6 hours (core) | 6–8 hours (with bonus)
**Submission:** GitHub repository

---

## Overview

Build a **Task Management REST API**. This is not a tutorial — we expect production-quality thinking: proper error handling, clean layering, and a schema that won't fall apart at scale.

---

## Database Schema

Design and migrate the following schema. Use `uuid` as primary key on all tables.

```sql
tasks
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  title         VARCHAR(255) NOT NULL
  description   TEXT
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'   -- 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority      SMALLINT NOT NULL DEFAULT 2              -- 1 (high) | 2 (medium) | 3 (low)
  due_date      TIMESTAMPTZ
  deleted_at    TIMESTAMPTZ                              -- NULL = not deleted (soft delete)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

- Write a migration file (not a raw SQL dump — use a migration tool or numbered `.sql` files)
- Add indexes where appropriate — explain your choices in the README

---

## API Specification

### 1. Create Task

**`POST /tasks`**

```json
// Request
{
  "title": "Finish API documentation",
  "description": "Cover all endpoints with examples",
  "priority": 1,
  "due_date": "2025-09-01T09:00:00Z"
}

// Response 201
{
  "id": "a3f1c2d4-...",
  "title": "Finish API documentation",
  "description": "Cover all endpoints with examples",
  "status": "pending",
  "priority": 1,
  "due_date": "2025-09-01T09:00:00Z",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T09:00:00Z"
}
```

**Validation rules:**
- `title` — required, 1–255 characters
- `priority` — optional, must be `1`, `2`, or `3` if provided
- `due_date` — optional, but if provided must be a valid ISO 8601 date **in the future**
- Unknown fields in the request body → ignore (do not throw an error)

---

### 2. List Tasks

**`GET /tasks`**

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `priority` | number | Filter by priority |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `sort` | string | Field to sort by: `created_at`, `due_date`, `priority` (default: `created_at`) |
| `order` | string | `asc` or `desc` (default: `desc`) |

```json
// Response 200
{
  "data": [
    {
      "id": "a3f1c2d4-...",
      "title": "Finish API documentation",
      "status": "pending",
      "priority": 1,
      "due_date": "2025-09-01T09:00:00Z",
      "created_at": "2025-01-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 84,
    "total_pages": 5
  }
}
```

- Soft-deleted tasks must **never** appear in this list
- Invalid `sort` field → `400` with a clear error message

---

### 3. Get Single Task

**`GET /tasks/:id`**

```json
// Response 200 — same shape as a single item in the list above
// Response 404 if not found or soft-deleted
```

---

### 4. Update Task

**`PATCH /tasks/:id`**

Partial update — only include fields you want to change.

```json
// Request
{
  "status": "in_progress",
  "due_date": "2025-10-01T09:00:00Z"
}

// Response 200 — full updated task object
```

**Business rules:**
- Allowed status transitions:

```
pending → in_progress → completed
pending → cancelled
in_progress → cancelled
```

Any other transition (e.g., `completed → pending`) → `422 Unprocessable Entity`

- `due_date` updates follow the same future-date rule
- Updating a soft-deleted task → `404`

---

### 5. Delete Task

**`DELETE /tasks/:id`**

- Implement as **soft delete** (set `deleted_at = NOW()`)
- Response: `204 No Content`
- Deleting a task that doesn't exist → `404`
- Deleting an already-deleted task → `404` (treat as not found)

---

## Error Format

All errors must follow this shape — no exceptions:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "due_date", "message": "must be a future date" },
      { "field": "priority", "message": "must be 1, 2, or 3" }
    ]
  }
}
```

**Error codes to implement:**

| HTTP | `code` | When |
|------|--------|------|
| 400 | `VALIDATION_ERROR` | Invalid request body or query params |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 422 | `INVALID_STATUS_TRANSITION` | e.g., `completed → pending` |
| 500 | `INTERNAL_ERROR` | Unhandled exceptions |

---

## Project Structure

Follow this layering — no business logic in route handlers:

```
src/
  routes/          # HTTP routing only — no logic
  controllers/     # Parse request, call service, send response
  services/        # Business logic and validation rules
  repositories/    # Database queries only
  middleware/      # Auth, error handler, request logger
  errors/          # Custom error classes
  db/
    migrations/    # Migration files
    client.js      # DB connection
```

---

## What to Run

The project must start with:

```bash
docker-compose up
```

This should spin up PostgreSQL and the API server, run migrations automatically, and be ready to accept requests on `http://localhost:3000`.

Provide a `.env.example`:

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
NODE_ENV=development
```

---

## Testing

Write tests for:
- Happy path for each endpoint
- At least 3 validation error cases
- Invalid status transition
- Soft delete + verify it disappears from list

Use any test framework (Jest, Vitest, etc.). Tests must pass with `npm test`.

---

## Bonus (Optional)

These are signals of senior-level thinking. Do them only after core is solid.

- [ ] **JWT authentication** — `POST /auth/register` + `POST /auth/login`, protect all `/tasks` routes
- [ ] **Request logging** — log method, path, status code, and response time for every request
- [ ] **Graceful shutdown** — handle `SIGTERM`, finish in-flight requests before exiting
- [ ] **Overdue detection** — add an `is_overdue` boolean field to task responses (computed, not stored)

---

## Evaluation Criteria

| Area | What we actually check |
|------|------------------------|
| **API correctness** | Do status codes and response shapes match the spec exactly? |
| **Validation** | Does every invalid input return a clear, structured error? |
| **Business rules** | Are status transitions enforced? Soft deletes consistent? |
| **DB schema** | Appropriate types, indexes, constraints — and can you explain them? |
| **Layering** | Is business logic isolated in the service layer? |
| **Error handling** | Global handler in place? No unhandled rejections crashing the server? |
| **Tests** | Do they run? Do they cover edge cases, not just the happy path? |
| **README** | Can we run your project in under 2 minutes from a fresh clone? |

---

## README Requirements

Your README must include:

1. **How to run** — single command from a fresh clone to a working API
2. **Design decisions** — why you chose your migration approach, how you handled soft deletes, why specific indexes
3. **Status transition logic** — explain the allowed transitions and where they are enforced in code
4. **Trade-offs** — what you'd do differently with more time or at larger scale
5. **Assumptions** — anything not specified that you decided on your own

---

## Common Mistakes That Will Cost You

- Returning `200` on create instead of `201`
- No migration files — schema.sql doesn't count
- Business logic sitting in route handlers
- Generic `"Something went wrong"` messages with no error code
- Tests that only test the happy path
- App crashes on malformed JSON body instead of returning `400`
- `deleted_at` tasks appearing in `GET /tasks` results
