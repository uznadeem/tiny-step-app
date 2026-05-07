create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null unique,
  subject text not null,
  html_body text not null
);

create table if not exists public.waitlist_subscribers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null unique,
  welcome_sent_at timestamptz,
  followup_sent_at timestamptz,
  launch_sent_at timestamptz,
  status text not null default 'subscribed'
);

alter table public.email_templates enable row level security;
alter table public.waitlist_subscribers enable row level security;

revoke all on public.email_templates from anon, authenticated;
revoke all on public.waitlist_subscribers from anon, authenticated;

grant select, insert, update, delete on public.email_templates to service_role;
grant select, insert, update, delete on public.waitlist_subscribers to service_role;
