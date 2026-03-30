-- LaunchPad CICF - Supabase schema (clean start)
-- This script creates structure only.
-- It intentionally inserts ZERO demo/sample rows.

create extension if not exists pgcrypto;
create extension if not exists citext;

-- Enums
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'faculty', 'incubatee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ui_theme AS ENUM ('light', 'dark');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ui_font_size AS ENUM ('small', 'medium', 'large');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_source AS ENUM ('system', 'admin', 'faculty', 'incubatee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_category AS ENUM ('system', 'update');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE email_delivery_result AS ENUM ('queued', 'delivered', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lifecycle_stage AS ENUM ('post_prototype', 'phase_alpha', 'beta_testing', 'market_ready');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_state AS ENUM ('good', 'watch', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incubatee_state AS ENUM ('active', 'graduating', 'paused');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_health AS ENUM ('healthy', 'watch', 'at_risk');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'rework_requested', 'approved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE presentation_status AS ENUM ('draft', 'submitted', 'under_review', 'rework_requested', 'approved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rework_requested');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'settled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_stage AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opening_status AS ENUM ('draft', 'open', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE intern_status AS ENUM ('on_track', 'needs_attention', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pipeline_stage AS ENUM ('applied', 'screening', 'interview', 'offer', 'joined');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE template_status AS ENUM ('draft', 'active');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE template_audience AS ENUM ('faculty', 'incubatees', 'admin', 'all');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE quarter_label AS ENUM ('q1', 'q2', 'q3', 'q4');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Common trigger function
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core auth/user tables
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email citext not null unique,
  role app_role not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_users_email_lower on users ((lower(email::text)));
create index if not exists idx_users_role on users (role);

create table if not exists auth_sessions (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_auth_sessions_user_id on auth_sessions (user_id);
create index if not exists idx_auth_sessions_issued_at on auth_sessions (issued_at desc);

create table if not exists password_reset_tokens (
  token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chk_reset_token_length check (char_length(token) >= 6)
);

create index if not exists idx_password_reset_user_id on password_reset_tokens (user_id);
create index if not exists idx_password_reset_expires on password_reset_tokens (expires_at);

-- Settings + device sessions by role (to match current API behavior)
create table if not exists role_settings (
  role app_role primary key,
  full_name text not null default '',
  display_name text not null default '',
  email citext,
  phone text,
  organization text,
  two_factor boolean not null default false,
  notify_email boolean not null default true,
  notify_in_app boolean not null default false,
  notify_deadline boolean not null default true,
  notify_weekly boolean not null default true,
  quiet_start time not null default '22:00',
  quiet_end time not null default '07:00',
  theme ui_theme not null default 'light',
  font_size ui_font_size not null default 'medium',
  reduced_motion boolean not null default false,
  high_contrast boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists role_device_sessions (
  id uuid primary key default gen_random_uuid(),
  role app_role not null,
  device text not null,
  location text,
  last_active_at timestamptz not null default now(),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_role_device_sessions_role on role_device_sessions (role);
create index if not exists idx_role_device_sessions_current on role_device_sessions (role, is_current);

-- Incubatee profile + dashboard data
create table if not exists incubatee_profiles (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null unique,
  cicf_id text unique,
  founder_name text not null,
  founder_email citext not null,
  phone text,
  domain text,
  headquarters text,
  overview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists incubatee_team_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references incubatee_profiles(id) on delete cascade,
  member_name text not null,
  member_role text not null,
  member_email citext,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_incubatee_team_members_profile on incubatee_team_members (profile_id);

create table if not exists incubatee_dashboard_metrics (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  label text not null,
  value integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (startup_name, label)
);

create table if not exists incubatee_quick_actions (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  action_label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (startup_name, action_label)
);

-- Project + submission workflow
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  name text not null,
  owner text,
  stage lifecycle_stage not null default 'post_prototype',
  health project_health not null default 'healthy',
  budget_used_percent integer not null default 0,
  progress_percent integer not null default 0,
  next_milestone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_projects_budget_pct check (budget_used_percent between 0 and 100),
  constraint chk_projects_progress_pct check (progress_percent between 0 and 100)
);

create index if not exists idx_projects_startup_name on projects (startup_name);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  asset_name text not null,
  stage_label text not null,
  owner text,
  due_date date,
  status submission_status not null default 'draft',
  attempt integer not null default 0,
  feedback text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_submissions_attempt_nonnegative check (attempt >= 0)
);

create index if not exists idx_submissions_status on submissions (status);
create index if not exists idx_submissions_due_date on submissions (due_date);
create index if not exists idx_submissions_startup_name on submissions (startup_name);

create table if not exists faculty_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  startup_name text not null,
  artifact_name text not null,
  stage_label text not null,
  submitted_at date,
  status review_status not null default 'pending',
  reviewer_name text not null default 'Pending Assignment',
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id)
);

create index if not exists idx_faculty_reviews_status on faculty_reviews (status);
create index if not exists idx_faculty_reviews_startup on faculty_reviews (startup_name);

create table if not exists presentation_packages (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null unique,
  active_stage text not null default 'stage1',
  status presentation_status not null default 'draft',
  attempt_number integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_presentation_attempt_nonnegative check (attempt_number >= 0)
);

create table if not exists presentation_uploads (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references presentation_packages(id) on delete cascade,
  stage_key text not null,
  board_deck_file text,
  rubric_readiness_file text,
  financial_briefing_file text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, stage_key)
);

create table if not exists progress_records (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  quarter quarter_label not null,
  submission_code text,
  status submission_status not null default 'draft',
  submitted_at timestamptz,
  reviewer_name text,
  file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (startup_name, quarter)
);

create index if not exists idx_progress_records_startup on progress_records (startup_name);

-- Internship module
create table if not exists intern_openings (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  role_name text not null,
  department text not null,
  duration_label text not null,
  duration_weeks integer not null,
  stipend_label text not null,
  status opening_status not null default 'draft',
  applicants integer not null default 0,
  created_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_intern_openings_duration_positive check (duration_weeks > 0),
  constraint chk_intern_openings_applicants_nonnegative check (applicants >= 0)
);

create index if not exists idx_intern_openings_startup on intern_openings (startup_name);
create index if not exists idx_intern_openings_status on intern_openings (status);

create table if not exists interns (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  intern_name text not null,
  university text,
  mentor_name text,
  start_date date,
  end_date date,
  progress_percent integer not null default 0,
  attendance_percent integer not null default 0,
  score numeric(4,2),
  status intern_status not null default 'on_track',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_interns_progress check (progress_percent between 0 and 100),
  constraint chk_interns_attendance check (attendance_percent between 0 and 100),
  constraint chk_interns_score check (score is null or (score >= 0 and score <= 10))
);

create index if not exists idx_interns_startup on interns (startup_name);
create index if not exists idx_interns_status on interns (status);

create table if not exists internship_pipeline_candidates (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  candidate_name text not null,
  role_name text not null,
  stage pipeline_stage not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pipeline_stage on internship_pipeline_candidates (stage);

create table if not exists mentor_assignments (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  intern_name text not null,
  mentor_name text not null,
  capacity_used integer not null default 0,
  capacity_total integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_mentor_capacity_total_positive check (capacity_total > 0),
  constraint chk_mentor_capacity_used_nonnegative check (capacity_used >= 0),
  constraint chk_mentor_capacity_bounds check (capacity_used <= capacity_total)
);

create table if not exists compliance_checklist_items (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  label text not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (startup_name, label)
);

-- Finance
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  category text not null,
  amount_text text not null,
  submitted_at date not null default current_date,
  status claim_status not null default 'in_review',
  reference_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_claims_status on claims (status);
create index if not exists idx_claims_startup on claims (startup_name);

create table if not exists payout_schedule (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  payout_date date not null,
  title text not null,
  amount_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists budget_bands (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  name text not null,
  used_percent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_budget_used_percent check (used_percent between 0 and 100),
  unique (startup_name, name)
);

-- Support
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  title text not null,
  category text not null,
  priority ticket_priority not null default 'medium',
  stage ticket_stage not null default 'open',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_stage on support_tickets (stage);
create index if not exists idx_support_tickets_priority on support_tickets (priority);

create table if not exists support_knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mentorship
create table if not exists mentorship_mentees (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  founder_name text not null,
  focus text,
  progress_percent integer not null default 0,
  next_session_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_mentee_progress check (progress_percent between 0 and 100)
);

create table if not exists mentorship_logs (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  title text not null,
  log_date date not null default current_date,
  action text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin reference tables
create table if not exists admin_incubatees (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null unique,
  founder_name text not null,
  stage lifecycle_stage not null default 'post_prototype',
  compliance compliance_state not null default 'good',
  status incubatee_state not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists faculty_directory (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null,
  specialization text,
  active_reviews integer not null default 0,
  capacity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_faculty_active_reviews check (active_reviews >= 0),
  constraint chk_faculty_capacity check (capacity > 0)
);

create table if not exists system_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience template_audience not null,
  status template_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, audience)
);

-- Notification + email delivery
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  source notification_source not null default 'system',
  priority notification_priority not null default 'low',
  category notification_category not null default 'update',
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_created_at on notifications (created_at desc);
create index if not exists idx_notifications_priority on notifications (priority);

create table if not exists notification_audience (
  notification_id uuid not null references notifications(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  primary key (notification_id, role)
);

create index if not exists idx_notification_audience_role on notification_audience (role);

create table if not exists notification_state (
  notification_id uuid not null references notifications(id) on delete cascade,
  role app_role not null,
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (notification_id, role)
);

create index if not exists idx_notification_state_role on notification_state (role, is_dismissed, is_read);

create table if not exists email_delivery_log (
  id uuid primary key default gen_random_uuid(),
  email_type text not null,
  audience_role app_role not null,
  recipients_count integer not null default 0,
  provider text not null default 'resend',
  result email_delivery_result not null default 'queued',
  sent_at timestamptz not null default now()
);

create index if not exists idx_email_delivery_sent_at on email_delivery_log (sent_at desc);
create index if not exists idx_email_delivery_role on email_delivery_log (audience_role);

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_role_settings_updated_at ON role_settings;
CREATE TRIGGER trg_role_settings_updated_at BEFORE UPDATE ON role_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_role_device_sessions_updated_at ON role_device_sessions;
CREATE TRIGGER trg_role_device_sessions_updated_at BEFORE UPDATE ON role_device_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_incubatee_profiles_updated_at ON incubatee_profiles;
CREATE TRIGGER trg_incubatee_profiles_updated_at BEFORE UPDATE ON incubatee_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_incubatee_team_members_updated_at ON incubatee_team_members;
CREATE TRIGGER trg_incubatee_team_members_updated_at BEFORE UPDATE ON incubatee_team_members
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_incubatee_dashboard_metrics_updated_at ON incubatee_dashboard_metrics;
CREATE TRIGGER trg_incubatee_dashboard_metrics_updated_at BEFORE UPDATE ON incubatee_dashboard_metrics
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_incubatee_quick_actions_updated_at ON incubatee_quick_actions;
CREATE TRIGGER trg_incubatee_quick_actions_updated_at BEFORE UPDATE ON incubatee_quick_actions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON submissions;
CREATE TRIGGER trg_submissions_updated_at BEFORE UPDATE ON submissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_faculty_reviews_updated_at ON faculty_reviews;
CREATE TRIGGER trg_faculty_reviews_updated_at BEFORE UPDATE ON faculty_reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_presentation_packages_updated_at ON presentation_packages;
CREATE TRIGGER trg_presentation_packages_updated_at BEFORE UPDATE ON presentation_packages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_presentation_uploads_updated_at ON presentation_uploads;
CREATE TRIGGER trg_presentation_uploads_updated_at BEFORE UPDATE ON presentation_uploads
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_progress_records_updated_at ON progress_records;
CREATE TRIGGER trg_progress_records_updated_at BEFORE UPDATE ON progress_records
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_intern_openings_updated_at ON intern_openings;
CREATE TRIGGER trg_intern_openings_updated_at BEFORE UPDATE ON intern_openings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_interns_updated_at ON interns;
CREATE TRIGGER trg_interns_updated_at BEFORE UPDATE ON interns
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_internship_pipeline_candidates_updated_at ON internship_pipeline_candidates;
CREATE TRIGGER trg_internship_pipeline_candidates_updated_at BEFORE UPDATE ON internship_pipeline_candidates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_mentor_assignments_updated_at ON mentor_assignments;
CREATE TRIGGER trg_mentor_assignments_updated_at BEFORE UPDATE ON mentor_assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_compliance_checklist_items_updated_at ON compliance_checklist_items;
CREATE TRIGGER trg_compliance_checklist_items_updated_at BEFORE UPDATE ON compliance_checklist_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_claims_updated_at ON claims;
CREATE TRIGGER trg_claims_updated_at BEFORE UPDATE ON claims
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_payout_schedule_updated_at ON payout_schedule;
CREATE TRIGGER trg_payout_schedule_updated_at BEFORE UPDATE ON payout_schedule
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_budget_bands_updated_at ON budget_bands;
CREATE TRIGGER trg_budget_bands_updated_at BEFORE UPDATE ON budget_bands
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON support_tickets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_support_knowledge_articles_updated_at ON support_knowledge_articles;
CREATE TRIGGER trg_support_knowledge_articles_updated_at BEFORE UPDATE ON support_knowledge_articles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_mentorship_mentees_updated_at ON mentorship_mentees;
CREATE TRIGGER trg_mentorship_mentees_updated_at BEFORE UPDATE ON mentorship_mentees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_mentorship_logs_updated_at ON mentorship_logs;
CREATE TRIGGER trg_mentorship_logs_updated_at BEFORE UPDATE ON mentorship_logs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_admin_incubatees_updated_at ON admin_incubatees;
CREATE TRIGGER trg_admin_incubatees_updated_at BEFORE UPDATE ON admin_incubatees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_faculty_directory_updated_at ON faculty_directory;
CREATE TRIGGER trg_faculty_directory_updated_at BEFORE UPDATE ON faculty_directory
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_system_templates_updated_at ON system_templates;
CREATE TRIGGER trg_system_templates_updated_at BEFORE UPDATE ON system_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_notification_state_updated_at ON notification_state;
CREATE TRIGGER trg_notification_state_updated_at BEFORE UPDATE ON notification_state
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Notification helper functions
create or replace function lp_create_notification(
  p_title text,
  p_message text,
  p_source notification_source default 'system',
  p_priority notification_priority default 'low',
  p_category notification_category default 'update',
  p_roles app_role[] default array['admin', 'faculty', 'incubatee']::app_role[]
)
returns uuid
language plpgsql
as $$
declare
  v_notification_id uuid;
begin
  insert into notifications (title, message, source, priority, category)
  values (p_title, p_message, p_source, p_priority, p_category)
  returning id into v_notification_id;

  insert into notification_audience (notification_id, role)
  select v_notification_id, role_value
  from (
    select distinct unnest(coalesce(p_roles, array['admin', 'faculty', 'incubatee']::app_role[])) as role_value
  ) as roles;

  insert into notification_state (notification_id, role, is_read, is_dismissed)
  select v_notification_id, role, false, false
  from notification_audience
  where notification_id = v_notification_id;

  return v_notification_id;
end;
$$;

create or replace function lp_notification_feed(p_role app_role)
returns table (
  id uuid,
  title text,
  message text,
  source notification_source,
  priority notification_priority,
  category notification_category,
  read boolean,
  created_at timestamptz,
  time_label text,
  hours_ago numeric
)
language sql
stable
as $$
  select
    n.id,
    n.title,
    n.message,
    n.source,
    n.priority,
    n.category,
    ns.is_read as read,
    n.created_at,
    case
      when extract(epoch from now() - n.created_at) < 3600
        then greatest(1, round((extract(epoch from now() - n.created_at) / 60.0)))::int || ' mins ago'
      when extract(epoch from now() - n.created_at) < 86400
        then round((extract(epoch from now() - n.created_at) / 3600.0))::int || ' hours ago'
      when extract(epoch from now() - n.created_at) < 604800
        then round((extract(epoch from now() - n.created_at) / 86400.0))::int || ' days ago'
      else to_char(n.created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY')
    end as time_label,
    round((extract(epoch from now() - n.created_at) / 3600.0)::numeric, 2) as hours_ago
  from notifications n
  join notification_audience na
    on na.notification_id = n.id
   and na.role = p_role
  join notification_state ns
    on ns.notification_id = n.id
   and ns.role = p_role
  where ns.is_dismissed = false
  order by n.created_at desc;
$$;

create or replace function lp_notification_stats(p_role app_role)
returns table (
  total integer,
  unread integer,
  high_priority integer
)
language sql
stable
as $$
  with feed as (
    select *
    from lp_notification_feed(p_role)
  )
  select
    count(*)::int as total,
    count(*) filter (where read = false)::int as unread,
    count(*) filter (where read = false and priority = 'high')::int as high_priority
  from feed;
$$;

create or replace function lp_mark_all_notifications_read(p_role app_role)
returns integer
language plpgsql
as $$
declare
  v_updated integer;
begin
  update notification_state ns
  set is_read = true,
      updated_at = now()
  from notification_audience na
  where ns.notification_id = na.notification_id
    and ns.role = na.role
    and na.role = p_role
    and ns.is_dismissed = false
    and ns.is_read = false;

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

create or replace function lp_clear_read_notifications(p_role app_role)
returns integer
language plpgsql
as $$
declare
  v_updated integer;
begin
  update notification_state ns
  set is_dismissed = true,
      updated_at = now()
  from notification_audience na
  where ns.notification_id = na.notification_id
    and ns.role = na.role
    and na.role = p_role
    and ns.is_read = true
    and ns.is_dismissed = false;

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

-- Workflow functions mirroring current backend behavior
create or replace function lp_apply_review_decision(
  p_review_id uuid,
  p_decision text,
  p_comment text default null,
  p_reviewer_name text default 'Faculty Reviewer'
)
returns table (
  review_id uuid,
  submission_id uuid,
  review_status review_status,
  submission_status submission_status,
  notification_id uuid
)
language plpgsql
as $$
declare
  v_review_status review_status;
  v_submission_status submission_status;
  v_submission_id uuid;
  v_startup text;
  v_artifact text;
  v_title text;
  v_message text;
  v_notification_id uuid;
  v_role app_role;
  v_recipients integer;
begin
  v_review_status := case lower(coalesce(p_decision, ''))
    when 'approve' then 'approved'
    when 'rework' then 'rework_requested'
    else 'pending'
  end;

  update faculty_reviews
  set status = v_review_status,
      comment = case when coalesce(trim(p_comment), '') = '' then comment else p_comment end,
      reviewer_name = case when coalesce(trim(p_reviewer_name), '') = '' then reviewer_name else p_reviewer_name end,
      updated_at = now()
  where id = p_review_id
  returning submission_id, startup_name, artifact_name
  into v_submission_id, v_startup, v_artifact;

  if not found then
    raise exception 'review_not_found';
  end if;

  v_submission_status := case v_review_status
    when 'approved' then 'approved'
    when 'rework_requested' then 'rework_requested'
    else 'submitted'
  end;

  update submissions
  set status = v_submission_status,
      feedback = case when coalesce(trim(p_comment), '') = '' then feedback else p_comment end,
      attempt = case when v_submission_status = 'submitted' then attempt + 1 else attempt end,
      updated_at = now()
  where id = v_submission_id;

  v_title := case v_review_status
    when 'approved' then 'Submission Approved'
    when 'rework_requested' then 'Submission Rework Requested'
    else 'Submission Review Updated'
  end;

  v_message := format(
    '%s for %s is now %s by %s.',
    v_artifact,
    v_startup,
    initcap(replace(v_review_status::text, '_', ' ')),
    coalesce(nullif(trim(p_reviewer_name), ''), 'Faculty Reviewer')
  );

  v_notification_id := lp_create_notification(
    v_title,
    v_message,
    'faculty',
    case when v_review_status = 'rework_requested' then 'high' else 'medium' end,
    'update',
    array['incubatee', 'admin']::app_role[]
  );

  for v_role in select unnest(array['incubatee', 'admin']::app_role[])
  loop
    select count(*) into v_recipients
    from users
    where role = v_role
      and is_active = true;

    insert into email_delivery_log (email_type, audience_role, recipients_count, provider, result)
    values ('Review Decision Update', v_role, coalesce(v_recipients, 0), 'resend', 'queued');
  end loop;

  return query
  select p_review_id, v_submission_id, v_review_status, v_submission_status, v_notification_id;
end;
$$;

create or replace function lp_apply_claim_decision(
  p_claim_id uuid,
  p_decision text,
  p_actor_name text default 'Admin Finance'
)
returns table (
  claim_id uuid,
  claim_status claim_status,
  notification_id uuid
)
language plpgsql
as $$
declare
  v_status claim_status;
  v_startup text;
  v_category text;
  v_reference text;
  v_title text;
  v_message text;
  v_notification_id uuid;
  v_role app_role;
  v_recipients integer;
begin
  v_status := case lower(coalesce(p_decision, ''))
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    else 'in_review'
  end;

  update claims
  set status = v_status,
      updated_at = now()
  where id = p_claim_id
  returning startup_name, category, reference_code
  into v_startup, v_category, v_reference;

  if not found then
    raise exception 'claim_not_found';
  end if;

  v_title := 'Claim ' || initcap(replace(v_status::text, '_', ' '));
  v_message := format(
    '%s (%s) for %s is %s by %s.',
    v_category,
    v_reference,
    v_startup,
    lower(replace(v_status::text, '_', ' ')),
    coalesce(nullif(trim(p_actor_name), ''), 'Admin Finance')
  );

  v_notification_id := lp_create_notification(
    v_title,
    v_message,
    'admin',
    case when v_status = 'rejected' then 'high' else 'medium' end,
    'update',
    array['incubatee', 'faculty']::app_role[]
  );

  for v_role in select unnest(array['incubatee', 'faculty']::app_role[])
  loop
    select count(*) into v_recipients
    from users
    where role = v_role
      and is_active = true;

    insert into email_delivery_log (email_type, audience_role, recipients_count, provider, result)
    values ('Claim Decision Update', v_role, coalesce(v_recipients, 0), 'resend', 'queued');
  end loop;

  return query
  select p_claim_id, v_status, v_notification_id;
end;
$$;

create or replace function lp_queue_campaign(
  p_template text,
  p_audience template_audience,
  p_subject text
)
returns uuid
language plpgsql
as $$
declare
  v_roles app_role[];
  v_role app_role;
  v_recipients integer;
  v_message text;
  v_notification_id uuid;
begin
  v_roles := case p_audience
    when 'faculty' then array['faculty']::app_role[]
    when 'incubatees' then array['incubatee']::app_role[]
    when 'admin' then array['admin']::app_role[]
    else array['admin', 'faculty', 'incubatee']::app_role[]
  end;

  v_message := format('Campaign %s has been queued for %s.', p_template, p_audience::text);

  v_notification_id := lp_create_notification(
    'Campaign Queued',
    v_message,
    'system',
    'low',
    'system',
    v_roles
  );

  for v_role in select unnest(v_roles)
  loop
    select count(*) into v_recipients
    from users
    where role = v_role
      and is_active = true;

    insert into email_delivery_log (email_type, audience_role, recipients_count, provider, result)
    values (p_template, v_role, coalesce(v_recipients, 0), 'resend', 'queued');
  end loop;

  return v_notification_id;
end;
$$;
