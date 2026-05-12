alter table public.profiles
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists stripe_price_id text,
add column if not exists plan_interval text,
add column if not exists trial_started_at timestamptz,
add column if not exists trial_ends_at timestamptz,
add column if not exists current_period_end timestamptz,
add column if not exists cancel_at_period_end boolean not null default false,
add column if not exists stripe_status text;

update public.profiles
set
  trial_started_at = coalesce(trial_started_at, now()),
  trial_ends_at = coalesce(trial_ends_at, now() + interval '7 days'),
  status = coalesce(status, 'trial'::public.profile_status)
where trial_started_at is null
   or trial_ends_at is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    status,
    trial_started_at,
    trial_ends_at
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    'trial',
    now(),
    now() + interval '7 days'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = excluded.display_name,
    updated_at = now();

  return new;
end;
$$;

create or replace function public.protect_profile_billing_fields()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('postgres', 'supabase_admin') or coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  new.status = old.status;
  new.stripe_customer_id = old.stripe_customer_id;
  new.stripe_subscription_id = old.stripe_subscription_id;
  new.stripe_price_id = old.stripe_price_id;
  new.plan_interval = old.plan_interval;
  new.trial_started_at = old.trial_started_at;
  new.trial_ends_at = old.trial_ends_at;
  new.current_period_end = old.current_period_end;
  new.cancel_at_period_end = old.cancel_at_period_end;
  new.stripe_status = old.stripe_status;

  return new;
end;
$$;

drop trigger if exists profiles_protect_billing_fields on public.profiles;

create trigger profiles_protect_billing_fields
  before update on public.profiles
  for each row
  execute function public.protect_profile_billing_fields();
