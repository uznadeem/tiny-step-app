create table if not exists public.llm_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.llm_daily_usage enable row level security;

revoke all on public.llm_daily_usage from anon, authenticated;
grant select, insert, update on public.llm_daily_usage to service_role;

create or replace function public.consume_llm_quota(
  p_user_id uuid,
  p_daily_limit integer default 20,
  p_time_zone text default 'Asia/Karachi'
)
returns table (
  allowed boolean,
  used integer,
  remaining integer,
  daily_limit integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usage_date date;
  v_reset_at timestamptz;
  v_request_count integer;
begin
  if p_user_id is null then
    raise exception 'User id is required.';
  end if;

  if p_daily_limit < 1 then
    raise exception 'Daily limit must be greater than zero.';
  end if;

  v_usage_date := (now() at time zone p_time_zone)::date;
  v_reset_at := ((v_usage_date + 1)::timestamp at time zone p_time_zone);

  insert into public.llm_daily_usage (user_id, usage_date, request_count)
  values (p_user_id, v_usage_date, 1)
  on conflict (user_id, usage_date)
  do update
  set
    request_count = public.llm_daily_usage.request_count + 1,
    updated_at = now()
  where public.llm_daily_usage.request_count < p_daily_limit
  returning request_count into v_request_count;

  if v_request_count is null then
    select request_count
    into v_request_count
    from public.llm_daily_usage
    where user_id = p_user_id
      and usage_date = v_usage_date;

    return query
    select
      false,
      coalesce(v_request_count, p_daily_limit),
      0,
      p_daily_limit,
      v_reset_at;

    return;
  end if;

  return query
  select
    true,
    v_request_count,
    greatest(p_daily_limit - v_request_count, 0),
    p_daily_limit,
    v_reset_at;
end;
$$;

revoke all on function public.consume_llm_quota(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.consume_llm_quota(uuid, integer, text) to service_role;
