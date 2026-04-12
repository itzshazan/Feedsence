-- One-time seed for category-specific admin profiles.
-- This script maps known admin emails to admin_profiles by joining auth.users.
-- Update email/name/employee_id values below to match your real admins.

create temp table _admin_seed (
  email text primary key,
  name text not null,
  employee_id text not null,
  category text not null
);

insert into _admin_seed (email, name, employee_id, category)
values
  ('positive.feedback.admin@feedops.in', 'Positive Admin', 'ADM-POS-001', 'Positive Feedback'),
  ('negative.feedback.admin@feedops.in', 'Negative Admin', 'ADM-NEG-001', 'Negative Feedback'),
  ('complaint.admin@feedops.in', 'Complaint Admin', 'ADM-CMP-001', 'Complaint'),
  ('suggestion.admin@feedops.in', 'Suggestion Admin', 'ADM-SUG-001', 'Suggestion'),
  ('product.issue.admin@feedops.in', 'Product Issue Admin', 'ADM-PRD-001', 'Product Issue'),
  ('service.issue.admin@feedops.in', 'Service Issue Admin', 'ADM-SRV-001', 'Service Issue');

-- Warn if an email from this seed does not exist yet in auth.users.
do $$
declare
  missing_emails text;
begin
  select string_agg(s.email, ', ' order by s.email)
  into missing_emails
  from _admin_seed s
  left join auth.users u on lower(u.email) = lower(s.email)
  where u.id is null;

  if missing_emails is not null then
    raise notice 'Admin seed skipped missing auth users for emails: %', missing_emails;
  end if;
end
$$;

insert into public.admin_profiles (user_id, name, employee_id, category)
select
  u.id,
  s.name,
  s.employee_id,
  s.category
from _admin_seed s
join auth.users u on lower(u.email) = lower(s.email)
on conflict (user_id) do update
set
  name = excluded.name,
  employee_id = excluded.employee_id,
  category = excluded.category,
  updated_at = now();

drop table _admin_seed;
