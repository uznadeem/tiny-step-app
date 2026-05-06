do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'profile_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.profile_status as enum ('trial', 'active', 'inactive');
  end if;
end $$;

alter table public.profiles
add column if not exists status public.profile_status not null default 'trial';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, status)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    'trial'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = excluded.display_name,
    updated_at = now();

  return new;
end;
$$;
