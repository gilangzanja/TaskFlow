# Task List: TaskFlow Authentication and PostgreSQL

## Phase 1: Foundation

### Task 1: Preparing the Vite frontend and secure BFF

**Description:** Add Vite and Express, configure server-only Supabase settings, same-origin API proxying, security headers, and rate-limited authentication routes.

**Acceptance criteria:**
- [x] Frontend and BFF start with development settings and the frontend production build succeeds.
- [x] Server configuration rejects missing or invalid Supabase settings and production HTTP origins.
- [x] API responses include security headers; state-changing requests validate origin and JSON content type.
- [x] Registration and login routes use an in-memory rate limiter.
- [x] Supabase configuration is not included in the frontend bundle.

**Verification:**
- [x] Run `npm test` and `npm run build`.
- [x] Start the Vite frontend and BFF with temporary non-secret development settings.
- [x] Run the BFF without Supabase settings and verify the actionable startup error.

**Dependencies:** None  
**Files touched:** `package.json`, lockfile, Vite configuration, `.gitignore`, `.env.example`, `server/`, `assets/css/style.css`, `README.md`  
**Estimated scope:** Large

### Task 2: Defining the task table and ownership policies

**Description:** Add a versioned PostgreSQL migration for task fields, validation constraints, indexes, grants, and per-user RLS policies.

**Acceptance criteria:**
- [x] Migration defines UUID `id`, `user_id`, `title`, `description`, `status`, `priority`, and `due_date`, plus `category` and `created_at`.
- [x] RLS policies and table grants restrict CRUD to authenticated users.
- [x] Database constraints restrict task title, description, category, status, and priority values.

**Verification:**
- [x] Review the migration alongside server-side task validation.
- [x] Apply migration to the Supabase project; user confirmed the SQL Editor reported success.
- [ ] Verify owner access versus a second account; this live RLS check is still outstanding.

**Dependencies:** None  
**Files touched:** `supabase/migrations/20261023000000_create_tasks.sql`, `server/taskValidation.js`, `README.md`  
**Estimated scope:** Small

## Checkpoint: Foundation

- [x] Vite development and production build work.
- [ ] Apply schema and verify RLS with two Supabase test accounts.
- [x] No Supabase service-role key or server setting is embedded in frontend source.

## Phase 2: Authentication

### Task 3: Adding registration and sign-in through the BFF

**Description:** Add accessible registration and sign-in screens backed by Supabase Auth routes, with validation and safe user-facing errors.

**Acceptance criteria:**
- [x] Registration and sign-in flows call same-origin API routes.
- [x] Email and password validation runs in the browser and again on the server.
- [x] Passwords are not written to TaskFlow storage or logs.
- [x] Access and refresh tokens are issued only as `HttpOnly` cookies, never in JSON.
- [x] Email-confirmation state is communicated to users.

**Verification:**
- [x] Unit and HTTP tests cover authentication input validation, cookie flags, and origin rejection.
- [x] User confirmed registration and sign-in work with email confirmation disabled.
- [ ] Test email-confirmation delivery and sign-in with confirmation enabled.

**Dependencies:** Task 1  
**Files touched:** `index.html`, `assets/js/features/auth.js`, `server/routes/auth.js`, `server/sessionCookies.js`, `tests/`  
**Estimated scope:** Medium

### Task 4: Restoring sessions and protecting the dashboard

**Description:** Restore sessions from `HttpOnly` cookies, protect task API routes, refresh sessions server-side, and clear cookies on logout.

**Acceptance criteria:**
- [x] Frontend restores the current user through a same-origin API session endpoint.
- [x] Access and refresh tokens use bounded `HttpOnly`, `SameSite=Strict` cookies and `Secure` in production.
- [x] Unauthenticated task API requests are rejected; user task data is cleared on logout or authorization expiry.
- [x] Supabase session tokens are not stored by browser JavaScript.

**Verification:**
- [x] Unit and HTTP tests verify cookie attributes, expired access-token refresh, signed-out session responses, and unauthenticated API denial.
- [ ] Manually verify session restoration, refresh, logout, and account switching with a Supabase development project.

**Dependencies:** Task 3  
**Files touched:** `server/authMiddleware.js`, `server/routes/auth.js`, `assets/js/features/auth.js`, `assets/js/main.js`  
**Estimated scope:** Medium

## Checkpoint: Authentication

- [x] Registration, login, session restoration, and logout are connected end-to-end in code.
- [x] Unauthenticated users cannot use task API routes.
- [x] Token confidentiality is enforced by the BFF cookie boundary.
- [ ] Verify complete auth flow against a real Supabase project.

## Phase 3: Per-user task management

### Task 5: Loading and creating account-owned tasks through the API

**Description:** Load and create tasks through authenticated same-origin API calls with server-derived user ownership and Supabase RLS.

**Acceptance criteria:**
- [x] Frontend loads tasks from the API and uses API errors instead of local demo fallback.
- [x] Server assigns `user_id` from the verified Supabase user, not request input.
- [x] New tasks preserve current task fields and category.
- [x] Search, filters, deadline sorting, and dashboard statistics operate on the loaded list.

**Verification:**
- [x] Unit tests cover data mapping and same-origin task API requests without client-side auth tokens.
- [x] User confirmed task loading and creation work after applying the migration.
- [ ] Verify task ownership isolation with a second account.
- [ ] Manually verify search, filters, sorting, and dashboard statistics with live task data.

**Dependencies:** Tasks 2 and 4  
**Files touched:** `assets/js/main.js`, `assets/js/data/taskRepository.js`, `server/routes/tasks.js`, `server/taskValidation.js`  
**Estimated scope:** Medium

### Task 6: Updating and deleting account-owned tasks through the API

**Description:** Persist task edits, status/priority changes, and confirmed deletions through authenticated API routes.

**Acceptance criteria:**
- [x] Edit and status/priority changes update the database through the BFF.
- [x] Deletion requires confirmation and only reports success after the API succeeds.
- [x] Failed updates/deletes show an error instead of success feedback.
- [x] Server restricts update and delete by the verified owner and RLS.

**Verification:**
- [x] API operations are protected by auth middleware and ownership filters; input mapping is unit tested.
- [ ] Manually verify edit, status/priority changes, confirm-delete, and cancel-delete against Supabase.
- [ ] Verify full CRUD and cross-account denial against the Supabase project.

**Dependencies:** Tasks 2, 4, and 5  
**Files touched:** `assets/js/main.js`, `assets/js/data/taskRepository.js`, `server/routes/tasks.js`  
**Estimated scope:** Medium

## Checkpoint: Core task flows

- [x] Create, list, edit, update, and delete are wired per account.
- [x] Existing search, filters, sorting, statistics, and theme behavior are preserved in code.
- [x] Task data is no longer read from or written to `localStorage`.
- [x] Session tokens are inaccessible to browser JavaScript and cookies are cleared on logout.
- [ ] Verify all flows with live Supabase accounts and task data.

## Phase 4: Verification and handoff

### Task 7: Documenting setup and verifying the complete flow

**Description:** Document server-only Supabase configuration, database setup, development/production commands, cookie behavior, limitations, and validate the complete flow.

**Acceptance criteria:**
- [x] README explains project setup, migration, environment, auth redirects, and local commands.
- [x] README states that old `localStorage` tasks are not migrated and no service-role key is needed.
- [x] README documents HTTPS cookie requirements and the in-memory rate-limit single-instance limitation.
- [x] Unit tests and production build pass.
- [ ] Complete real-project acceptance checks with two Supabase accounts.

**Verification:**
- [x] `npm test`
- [x] `npm run build`
- [x] Local browser displayed the auth screen through the same-origin API.
- [x] `npm audit` reports no known vulnerabilities.
- [x] User confirmed migration success and that login plus task loading/creation work.
- [ ] Complete manual edit/delete, session lifecycle, and RLS checks using a second test account.

**Dependencies:** Tasks 1–6  
**Files touched:** `README.md`, `PRODUCT.md`, `tests/`  
**Estimated scope:** Medium

## Checkpoint: Complete

- [ ] All acceptance criteria pass, including live two-account CRUD and RLS verification.
- [x] Automated tests and production build pass.
- [x] Setup instructions and current limitations are documented.

## Remaining live Supabase checks

- [ ] Use a second test account to verify it cannot read, update, or delete the first account's tasks.
- [ ] Manually verify task edit, status/priority update, delete confirmation/cancellation, and dashboard filters.
- [ ] Manually verify session restore, logout, refresh, and account switching.
- [ ] If email confirmation will be enabled in production, configure a valid SMTP provider and test confirmation delivery.
