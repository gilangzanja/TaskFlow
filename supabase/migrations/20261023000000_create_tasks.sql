create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  category text not null default 'General' check (char_length(category) <= 100),
  status text not null default 'Todo'
    check (status in ('Todo', 'In Progress', 'Done')),
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High')),
  due_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_due_date_idx
  on public.tasks (user_id, due_date);

alter table public.tasks enable row level security;

revoke all on public.tasks from anon, authenticated;
grant select, insert, update, delete on public.tasks to authenticated;

create policy "Users can view their own tasks"
  on public.tasks
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own tasks"
  on public.tasks
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own tasks"
  on public.tasks
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own tasks"
  on public.tasks
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
