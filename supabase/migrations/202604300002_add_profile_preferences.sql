alter table public.profiles
add column if not exists preferences jsonb not null default '{
  "weeklyNudgeEmail": true,
  "confettiOnCompletion": true,
  "soundEffects": false,
  "defaultEnergy": 3
}'::jsonb;
