# TaskFlow Product Brief

## Product overview
TaskFlow is a lightweight personal task management dashboard for planning and tracking work across a single workspace. It helps the user break larger goals into smaller tasks, keep priorities visible, and monitor progress without a backend or account system.

## Primary user
- Individual worker or student managing personal tasks and deadlines
- User wants a simple, fast way to add, review, and update work items

## Core goals
- Capture tasks with a title, description, category, due date, status, and priority
- Keep the dashboard easy to scan at a glance
- Support quick task edits and deletions
- Help users find the right work using search and filters
- Give progress feedback through summary metrics and completion status

## Core user flows
1. Add a new task from the dashboard
2. Edit or update an existing task inline or from the modal form
3. Sort and filter by search term, status, and priority
4. Review dashboard insights for overall workload and task mix
5. Mark tasks complete or adjust priority as work changes

## Product behavior
- Tasks persist on the client using local storage
- The app is a single-page dashboard with sidebar navigation and route-like sections
- Theme switching is supported for light and dark mode
- The interface is designed for responsive usage on desktop and small screens

## Current surface
- Web application
- Static frontend built with HTML, CSS, and JavaScript
- Main entry file: index.html
- App logic: assets/js/main.js and related modules

## Non-goals
- Multi-user collaboration or shared team workspace
- Authentication or authorization
- Server-side task storage or sync
- Advanced project planning or team reporting

## Product quality bar
The product should feel reliable, visually clean, and fast. Interactions should be immediate, task management should remain simple, and the dashboard should remain understandable even with a growing task list.
