# TaskFlow Product Brief

## Product overview
TaskFlow is a personal task management dashboard for planning and tracking work across an individual account. It helps users break larger goals into smaller tasks, keep priorities visible, and monitor progress. Authentication and task persistence are provided by Supabase.

## Primary user
- Individual worker or student managing personal tasks and deadlines
- User wants a simple, fast way to add, review, and update work items

## Core goals
- Capture tasks with a title, description, category, due date, status, and priority
- Allow users to register, sign in, and manage their own tasks
- Persist task records in PostgreSQL and isolate records by authenticated user
- Keep the dashboard easy to scan at a glance
- Support quick task edits and deletions
- Help users find the right work using search and filters
- Give progress feedback through summary metrics and completion status

## Core user flows
1. Register or sign in to a personal account
2. Add a new task from the dashboard
3. Edit or update an existing task inline or from the modal form
4. Sort and filter by search term, status, and priority
5. Review dashboard insights for overall workload and task mix
6. Mark tasks complete or adjust priority as work changes

## Product behavior
- Supabase Auth manages account registration and sign-in through a same-origin backend
- The backend stores session tokens in `HttpOnly` cookies and refreshes them server-side
- Tasks persist in PostgreSQL and are isolated with Row Level Security
- Theme preference persists locally in the browser
- The app is a single-page dashboard with sidebar navigation and route-like sections
- Theme switching is supported for light and dark mode
- The interface is designed for responsive usage on desktop and small screens

## Current surface
- Web application
- Frontend built with HTML, CSS, and JavaScript
- Vite development server and build
- Express backend-for-frontend API
- Supabase Auth and PostgreSQL backend
- Main entry file: index.html
- App logic: assets/js/main.js and related modules

## Non-goals
- Multi-user collaboration or shared team workspace
- Importing existing browser-local tasks
- Advanced project planning or team reporting

## Product quality bar
The product should feel reliable, visually clean, and fast. Interactions should be immediate, task management should remain simple, and the dashboard should remain understandable even with a growing task list.
