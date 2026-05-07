create extension if not exists pgcrypto with schema extensions;

alter table public.waitlist_subscribers
add column if not exists unsubscribe_token text;

update public.waitlist_subscribers
set unsubscribe_token = encode(extensions.gen_random_bytes(32), 'hex')
where unsubscribe_token is null;

alter table public.waitlist_subscribers
alter column unsubscribe_token set default encode(extensions.gen_random_bytes(32), 'hex');

alter table public.waitlist_subscribers
alter column unsubscribe_token set not null;

create unique index if not exists waitlist_subscribers_unsubscribe_token_idx
on public.waitlist_subscribers (unsubscribe_token);
