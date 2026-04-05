-- MIGRATION 009 — API Rate Limiting via Database Triggers

-- 1. Protect the Reports table from getting spammed
create or replace function protect_report_spam()
returns trigger as $$
declare
  user_report_count int;
  listing_report_count int;
begin
  -- 1A: Restrict an authenticated user from spamming the whole platform
  if new.user_id is not null then
    select count(*) into user_report_count 
    from public.reports
    where user_id = new.user_id 
    and created_at > now() - interval '1 hour';

    if user_report_count >= 5 then
      raise exception 'Rate limit exceeded: You have reached the maximum reports allowed per hour (5).';
    end if;
  end if;

  -- 1B: Restrict a single listing from being hammered by Anonymous bots
  select count(*) into listing_report_count
  from public.reports
  where listing_id = new.listing_id
  and created_at > now() - interval '1 hour';

  -- If a listing genuinely gets 10 reports in an hour, it's flagged well enough for admins.
  -- Anything beyond 10 is likely a bot testing limits or malicious spam.
  if listing_report_count >= 10 then
    raise exception 'Rate limit exceeded: This listing has already received maximum reports for the hour.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger
drop trigger if exists trigger_protect_report_spam on public.reports;
create trigger trigger_protect_report_spam
  before insert on public.reports
  for each row execute function protect_report_spam();
