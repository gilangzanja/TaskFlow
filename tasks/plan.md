# Implementation Plan: TaskFlow Authentication and PostgreSQL

## Overview

Add account registration and login to TaskFlow, then store each authenticated user's tasks in PostgreSQL through Supabase. The frontend remains a single-page application, backed by a small same-origin Node.js API. The API manages Supabase Auth sessions using `HttpOnly` cookies and performs task operations with the user's access token; Row Level Security (RLS) remains the database authorization boundary. Existing browser-stored tasks will not be imported.

## Architecture Decisions

- Use Supabase Auth and its managed PostgreSQL database through a small same-origin Express BFF.
- Add Vite for the frontend and a small Express backend-for-frontend (BFF) for authentication/session and task API routes.
- Store the Supabase URL and anon/publishable key only in server environment configuration. Never expose the Supabase service-role key or any privileged credential.
- Keep access and refresh tokens in bounded, `HttpOnly`, `SameSite=Strict` cookies; use `Secure` cookies in production and validate request origins on mutations.
- Apply security headers and rate-limit registration/login endpoints.
- Enforce task ownership in PostgreSQL with RLS policies based on `auth.uid() = user_id`; client-side filtering is not an authorization boundary.
- Store `id`, `user_id`, `title`, `description`, `status`, `priority`, and `due_date`. Also retain `category` because it is an existing TaskFlow feature.
- Replace task reads/writes to `localStorage` with same-origin API calls backed by Supabase. Do not import or delete existing local task data as part of this change. Keep the theme preference local.
- Keep current dashboard features—search, filters, sorting, statistics, task edit, and delete—working against the signed-in user's task list.

## Task List

### Phase 1: Foundation

#### Task 1: Preparing the Vite frontend and secure BFF

**Description:** Add Vite and an Express BFF, install the Supabase SDK on the server, configure same-origin API proxying for development, and load Supabase settings from server-only environment variables. Add baseline security headers and a bounded rate limiter for auth endpoints.

**Acceptance criteria:**
- [x] Frontend and BFF can be started locally and the frontend can be built with documented npm scripts.
- [x] The server validates Supabase and application-origin configuration and reports actionable setup errors.
- [x] API responses include security headers; auth routes are rate-limited and mutation routes validate the same-origin request.
- [x] No privileged key or server-only setting is exposed to frontend bundles.

**Verification:**
- [x] Run the documented install, development, and production build commands.
- [x] Confirm missing server configuration prevents startup with an actionable error.

**Dependencies:** None  
**Files likely touched:** `package.json`, lockfile, Vite configuration, `.gitignore`, `.env.example`, server modules, frontend CSS setup, `README.md`  
**Estimated scope:** Medium

#### Task 2: Defining the task table and ownership policies

**Description:** Add a versioned SQL migration for the tasks table and RLS policies. Define field types, required values, defaults, and allowed status/priority values to match the existing application.

**Acceptance criteria:**
- [x] `tasks` includes UUID `id`, `user_id` referencing `auth.users`, `title`, `description`, `status`, `priority`, and `due_date`, plus `category` for compatibility with the current UI.
- [x] RLS is enabled and authenticated users can select, insert, update, and delete only rows whose `user_id` matches their authenticated user ID.
- [x] Database constraints reject invalid status/priority values and prevent a client from assigning a task to another user.

**Verification:**
- [x] Apply the migration to a Supabase development project (user confirmed successful execution).
- [ ] Verify CRUD access for the owner and confirm another authenticated user cannot read or modify the row.

**Dependencies:** None  
**Files likely touched:** SQL migration file(s), `README.md`  
**Estimated scope:** Small

### Checkpoint: Foundation

- [x] Vite development and production build work.
- [ ] The Supabase schema and RLS policies are applied and verified with two test accounts.
- [x] No privileged credential is exposed to the frontend.

### Phase 2: Authentication

#### Task 3: Adding registration and sign-in through the BFF

**Description:** Add accessible registration and login screens and connect them to same-origin BFF routes backed by Supabase Auth. Provide validation and clear feedback for invalid input, duplicate accounts, failed requests, and email confirmation when enabled in Supabase.

**Acceptance criteria:**
- [x] A user can register with email and password and can sign in with the resulting account through the BFF.
- [x] Forms validate required values and show understandable errors without exposing internal provider details.
- [x] Passwords are handled only by Supabase Auth and are never stored in TaskFlow tables, logs, or browser storage.
- [x] Auth tokens are returned only as `HttpOnly` cookies, never in JSON responses or client-readable storage.

**Verification:**
- [x] User confirmed registration and sign-in work with email confirmation disabled.
- [ ] Test unsuccessful registration/login and email-confirmation delivery with confirmation enabled.

**Dependencies:** Task 1  
**Files likely touched:** `index.html`, auth UI/module(s), server auth routes, CSS, `README.md`  
**Estimated scope:** Medium

#### Task 4: Restoring sessions and protecting the dashboard

**Description:** Restore the session from `HttpOnly` cookies on page load, keep unauthenticated users on the auth screen, and provide a logout action that clears cookies. Ensure the dashboard does not briefly reveal another user's task data during account transitions.

**Acceptance criteria:**
- [x] A valid cookie session opens the dashboard after refresh; an unauthenticated session shows the login/registration experience.
- [x] Logging out clears the active session and returns to the auth screen.
- [x] Switching accounts clears rendered task data before loading the new user's data.

**Verification:**
- [ ] Manually test refresh, logout, expired/invalid session, and switching between two accounts.
- [x] Confirm in code and tests that task data is not rendered before the active user's session is established.

**Dependencies:** Task 3  
**Files likely touched:** server session middleware, auth/session UI module(s), `assets/js/main.js`, navigation/UI module(s)  
**Estimated scope:** Medium

### Checkpoint: Authentication

- [ ] Registration, login, session restoration, and logout are all manually verified end-to-end against the live Supabase project.
- [x] Unauthenticated users cannot use the task API.
- [x] Authentication and task ownership are enforced by the BFF and Supabase RLS, not only by hidden UI.

### Phase 3: Per-user task management

#### Task 5: Loading and creating account-owned tasks through the API

**Description:** Replace initial task loading and task creation with authenticated same-origin API calls. The BFF creates a user-scoped Supabase client, while RLS independently restricts database access. Keep existing task cards, search, filters, sorting, and dashboard statistics behavior.

**Acceptance criteria:**
- [x] A signed-in user sees their tasks loaded from PostgreSQL.
- [x] New tasks are saved with the authenticated user's `user_id` and retain current fields, including category.
- [x] Loading and saving states and database errors are communicated; no local sample task is silently written to the account.

**Verification:**
- [ ] Create tasks under two accounts and confirm each account sees only its own list.
- [x] User confirmed task loading and creation work after applying the migration.
- [ ] Manually verify search, filters, deadline sorting, and statistics with live account data.

**Dependencies:** Tasks 2 and 4  
**Files likely touched:** `assets/js/main.js`, task data/access module(s), API task routes, UI rendering module(s)  
**Estimated scope:** Medium

#### Task 6: Updating and deleting account-owned tasks through the API

**Description:** Connect task edits, status/priority changes, and confirmed deletes to authenticated API routes while preserving the current dashboard interactions.

**Acceptance criteria:**
- [x] Editing task details and changing status or priority persists to PostgreSQL through the authenticated API.
- [x] A confirmed deletion removes the user's task; canceling confirmation leaves it unchanged.
- [x] Failed updates/deletes show an error and do not present a success state.

**Verification:**
- [ ] Manually exercise edit, status change, priority change, confirm-delete, and cancel-delete flows against Supabase.
- [ ] Confirm a user cannot update or delete another user's task, including by manipulating client requests.

**Dependencies:** Tasks 2, 4, and 5  
**Files likely touched:** `assets/js/main.js`, task data/access module(s), API task routes, related UI modules  
**Estimated scope:** Medium

### Checkpoint: Core task flows

- [ ] Verify with two live accounts that each can create, list, edit, update, and delete only its own tasks.
- [ ] Manually verify dashboard summary and task filtering after database changes.
- [x] Theme preference remains local, while task data is no longer read from or written to `localStorage`.
- [x] Access and refresh tokens remain inaccessible to browser JavaScript and are cleared on logout.

### Phase 4: Verification and handoff

#### Task 7: Documenting setup and verifying the complete flow

**Description:** Update project documentation for Supabase project setup, server-only environment configuration, database migration, auth redirect URLs, cookie/session behavior, local development, and the fact that existing local tasks are not imported. Run a focused end-to-end acceptance pass.

**Acceptance criteria:**
- [x] A contributor can configure a development Supabase project and run the app by following the README.
- [x] Documentation clearly states that old `localStorage` tasks are not migrated and Supabase settings are server-only.
- [x] Documentation describes production HTTPS requirements for secure cookies and the single-instance rate-limit limitation.
- [ ] The complete registration-to-task-management flow and the owner-isolation checks pass with two live accounts.

**Verification:**
- [x] `npm test` (28 tests) and `npm run build`.
- [x] User confirmed migration success and that login plus task loading/creation work.
- [ ] Perform a manual acceptance pass using two test accounts and check browser console/network errors.

**Dependencies:** Tasks 1–6  
**Files likely touched:** `README.md`, test files/configuration, minor fixes in affected modules  
**Estimated scope:** Medium

### Checkpoint: Complete

- [ ] All acceptance criteria above are met, including live two-account CRUD and RLS verification.
- [x] Build and automated tests pass.
- [x] Setup and limitations are documented for review.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS is missing or too permissive | One user could access another user's tasks | Make RLS mandatory in the migration and verify with two separate accounts before sign-off |
| A privileged key is exposed in the browser | Attackers could bypass intended database protections | Keep Supabase settings server-side and never use the service-role key |
| Auth tokens are exposed to browser JavaScript | An XSS could read active sessions | Store tokens only in HttpOnly cookies, apply security headers, encode user content, and validate origins |
| The BFF is deployed across multiple instances | In-memory auth rate limits are not shared | Document single-instance constraint; use a shared rate-limit store before horizontal scaling |
| Local configuration is unclear | Contributors cannot run the app or may commit local settings | Ignore local environment files and document `.env.example` |
| Existing tasks are expected to appear after login | Users may think tasks were lost | State explicitly that importing old browser data is out of scope; do not delete the old localStorage key |
| Auth redirect/email settings differ by Supabase project | Registration confirmation or login flow may fail | Document allowed redirect URLs and test with the selected project's auth settings |

## Open Questions

- A second test account is needed to verify cross-account RLS isolation and full CRUD.
- Email confirmation is currently disabled for the user's project; if enabled for production, configure a valid SMTP provider and test confirmation delivery.
