create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_text text not null,
  energy_level integer check (energy_level between 1 and 5),
  brain_dump text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  sort_order integer not null,
  time_minutes integer,
  tip text,
  stuck_advice text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at desc);

create index if not exists subtasks_task_id_sort_order_idx
  on public.subtasks (task_id, sort_order);

alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;

create policy "Users can read their own tasks"
  on public.tasks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read subtasks for their own tasks"
  on public.subtasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks
      where tasks.id = subtasks.task_id
        and tasks.user_id = auth.uid()
    )
  );

create policy "Users can create subtasks for their own tasks"
  on public.subtasks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tasks
      where tasks.id = subtasks.task_id
        and tasks.user_id = auth.uid()
    )
  );

create policy "Users can update subtasks for their own tasks"
  on public.subtasks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.tasks
      where tasks.id = subtasks.task_id
        and tasks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.tasks
      where tasks.id = subtasks.task_id
        and tasks.user_id = auth.uid()
    )
  );

create policy "Users can delete subtasks for their own tasks"
  on public.subtasks
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.tasks
      where tasks.id = subtasks.task_id
        and tasks.user_id = auth.uid()
    )
  );

drop trigger if exists tasks_set_updated_at on public.tasks;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();
