-- LaunchPad CICF - Full workflow smoke test (NO persistent data)
-- Run after: 01_supabase_schema_clean.sql
-- This script runs everything inside a transaction and rolls back.
-- If you want to keep data, replace ROLLBACK with COMMIT.

begin;

-- 1) Create baseline users (for role-targeted notifications + email logs)
insert into users (full_name, email, role, password_hash)
values
  ('Test Admin', 'admin.test@launchpad.local', 'admin', 'hash_admin_v1'),
  ('Test Faculty', 'faculty.test@launchpad.local', 'faculty', 'hash_faculty_v1'),
  ('Test Incubatee', 'incubatee.test@launchpad.local', 'incubatee', 'hash_incubatee_v1')
on conflict (email) do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  password_hash = excluded.password_hash,
  is_active = true,
  updated_at = now();

-- 2) Role settings + role sessions
insert into role_settings (
  role,
  full_name,
  display_name,
  email,
  phone,
  organization,
  two_factor,
  notify_email,
  notify_in_app,
  notify_deadline,
  notify_weekly,
  quiet_start,
  quiet_end,
  theme,
  font_size,
  reduced_motion,
  high_contrast
)
values
  ('admin', 'Test Admin', 'Admin QA', 'admin.test@launchpad.local', '+91-90000-00001', 'LaunchPad CICF', true, true, false, true, true, '22:00', '07:00', 'light', 'medium', false, false),
  ('faculty', 'Test Faculty', 'Faculty QA', 'faculty.test@launchpad.local', '+91-90000-00002', 'LaunchPad CICF Faculty', true, true, false, true, true, '21:00', '06:00', 'light', 'medium', false, false),
  ('incubatee', 'Test Incubatee', 'Incubatee QA', 'incubatee.test@launchpad.local', '+91-90000-00003', 'Zero Demo Labs', false, true, false, true, false, '22:00', '07:00', 'light', 'medium', false, false)
on conflict (role) do update
set
  full_name = excluded.full_name,
  display_name = excluded.display_name,
  email = excluded.email,
  phone = excluded.phone,
  organization = excluded.organization,
  two_factor = excluded.two_factor,
  notify_email = excluded.notify_email,
  notify_in_app = excluded.notify_in_app,
  notify_deadline = excluded.notify_deadline,
  notify_weekly = excluded.notify_weekly,
  quiet_start = excluded.quiet_start,
  quiet_end = excluded.quiet_end,
  theme = excluded.theme,
  font_size = excluded.font_size,
  reduced_motion = excluded.reduced_motion,
  high_contrast = excluded.high_contrast,
  updated_at = now();

insert into role_device_sessions (role, device, location, is_current)
values
  ('admin', 'Admin QA Workstation', 'Bangalore, India', true),
  ('faculty', 'Faculty QA Laptop', 'Chennai, India', true),
  ('incubatee', 'Incubatee QA Laptop', 'Bangalore, India', true);

-- 3) Incubatee profile + team
with p as (
  insert into incubatee_profiles (
    startup_name,
    cicf_id,
    founder_name,
    founder_email,
    phone,
    domain,
    headquarters,
    overview
  )
  values (
    'Zero Demo Labs',
    'CICF-TEST-001',
    'Test Founder',
    'incubatee.test@launchpad.local',
    '+91-90000-00003',
    'AI Ops',
    'Bangalore, India',
    'Scratch database validation profile.'
  )
  on conflict (startup_name) do update
  set
    cicf_id = excluded.cicf_id,
    founder_name = excluded.founder_name,
    founder_email = excluded.founder_email,
    phone = excluded.phone,
    domain = excluded.domain,
    headquarters = excluded.headquarters,
    overview = excluded.overview,
    updated_at = now()
  returning id
)
insert into incubatee_team_members (profile_id, member_name, member_role, member_email)
select p.id, x.member_name, x.member_role, x.member_email
from p
cross join (
  values
    ('Test Founder', 'Founder', 'founder@zerodemo.local'),
    ('Test CTO', 'CTO', 'cto@zerodemo.local')
) as x(member_name, member_role, member_email);

-- 4) Submission -> review -> decision workflow
with new_submission as (
  insert into submissions (
    startup_name,
    asset_name,
    stage_label,
    owner,
    due_date,
    status,
    attempt,
    feedback
  )
  values (
    'Zero Demo Labs',
    'Quarterly Progress PPT',
    'Stage 2',
    'QA Pod',
    current_date + interval '3 days',
    'submitted',
    1,
    ''
  )
  returning id, startup_name, asset_name, stage_label
)
insert into faculty_reviews (
  submission_id,
  startup_name,
  artifact_name,
  stage_label,
  submitted_at,
  status,
  reviewer_name,
  comment
)
select
  ns.id,
  ns.startup_name,
  ns.asset_name,
  ns.stage_label,
  current_date,
  'pending',
  'Dr Test Faculty',
  ''
from new_submission ns
returning id as created_review_id;

select *
from lp_apply_review_decision(
  (
    select id
    from faculty_reviews
    where startup_name = 'Zero Demo Labs'
    order by created_at desc
    limit 1
  ),
  'rework',
  'Please add revenue split by segment.',
  'Dr Test Faculty'
);

-- 5) Claim -> decision workflow
insert into claims (startup_name, category, amount_text, submitted_at, status, reference_code)
values ('Zero Demo Labs', 'Prototype Components', 'INR 120000', current_date, 'in_review', 'CLM-TEST-001')
returning id as created_claim_id;

select *
from lp_apply_claim_decision(
  (
    select id
    from claims
    where reference_code = 'CLM-TEST-001'
    limit 1
  ),
  'approve',
  'Admin QA'
);

-- 6) Campaign workflow
select lp_queue_campaign('Smoke Campaign', 'all', 'Smoke Campaign Subject') as campaign_notification_id;

-- 7) Notification reads/stats flows
select * from lp_notification_feed('admin');
select * from lp_notification_stats('admin');
select lp_mark_all_notifications_read('admin') as admin_marked_read_count;
select lp_clear_read_notifications('admin') as admin_cleared_read_count;
select * from lp_notification_stats('admin');

-- 8) Support ticket lifecycle (open -> in_progress -> resolved)
with created_ticket as (
  insert into support_tickets (startup_name, title, category, priority)
  values ('Zero Demo Labs', 'Unable to upload deck over 20MB', 'Submissions', 'high')
  returning id
)
update support_tickets
set stage = 'in_progress'
where id = (select id from created_ticket)
returning id, title, stage, updated_at;

update support_tickets
set stage = 'resolved'
where startup_name = 'Zero Demo Labs'
  and title = 'Unable to upload deck over 20MB'
returning id, title, stage, updated_at;

-- 9) Internship module
insert into intern_openings (
  startup_name,
  role_name,
  department,
  duration_label,
  duration_weeks,
  stipend_label,
  status,
  applicants
)
values (
  'Zero Demo Labs',
  'AI Product Intern',
  'Product',
  '12 weeks',
  12,
  'INR 20000 / month',
  'open',
  0
)
returning id as created_opening_id;

insert into interns (
  startup_name,
  intern_name,
  university,
  mentor_name,
  start_date,
  end_date,
  progress_percent,
  attendance_percent,
  score,
  status
)
values (
  'Zero Demo Labs',
  'Intern One',
  'Test University',
  'Dr Test Faculty',
  current_date,
  current_date + interval '90 days',
  40,
  95,
  8.20,
  'on_track'
)
returning id as created_intern_id;

update interns
set status = 'needs_attention'
where startup_name = 'Zero Demo Labs'
  and intern_name = 'Intern One'
returning id, intern_name, status, updated_at;

-- 10) Password reset lifecycle
insert into password_reset_tokens (token, user_id, expires_at)
values (
  'RESETTEST01',
  (select id from users where email = 'incubatee.test@launchpad.local'),
  now() + interval '30 minutes'
)
returning token, expires_at;

select token, (expires_at > now()) as is_valid
from password_reset_tokens
where token = 'RESETTEST01';

update users
set password_hash = 'hash_incubatee_v2'
where email = 'incubatee.test@launchpad.local'
returning id, email, updated_at;

delete from password_reset_tokens
where token = 'RESETTEST01'
returning token;

-- 11) Snapshot checks
select role, count(*)::int as user_count
from users
group by role
order by role;

select result, count(*)::int as email_events
from email_delivery_log
group by result
order by result;

select status, count(*)::int as claim_count
from claims
group by status
order by status;

-- IMPORTANT: keeps database clean (no demo rows persisted)
rollback;
