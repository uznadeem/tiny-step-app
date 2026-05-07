create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_type text not null,
  sent_at timestamptz not null default now()
);

create index if not exists email_logs_sent_at_idx
on public.email_logs (sent_at desc);

alter table public.email_logs enable row level security;

revoke all on public.email_logs from anon, authenticated;

grant select, insert on public.email_logs to service_role;
