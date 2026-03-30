-- LaunchPad CICF - hard reset data only (keeps schema)
-- Use this anytime you want a completely clean database state.

truncate table app_runtime_state restart identity cascade;
truncate table auth_sessions restart identity cascade;
truncate table password_reset_tokens restart identity cascade;
truncate table role_device_sessions restart identity cascade;
truncate table role_settings restart identity cascade;
truncate table incubatee_team_members restart identity cascade;
truncate table incubatee_dashboard_metrics restart identity cascade;
truncate table incubatee_quick_actions restart identity cascade;
truncate table presentation_uploads restart identity cascade;
truncate table presentation_packages restart identity cascade;
truncate table faculty_reviews restart identity cascade;
truncate table submissions restart identity cascade;
truncate table projects restart identity cascade;
truncate table progress_records restart identity cascade;
truncate table intern_openings restart identity cascade;
truncate table interns restart identity cascade;
truncate table internship_pipeline_candidates restart identity cascade;
truncate table mentor_assignments restart identity cascade;
truncate table compliance_checklist_items restart identity cascade;
truncate table claims restart identity cascade;
truncate table payout_schedule restart identity cascade;
truncate table budget_bands restart identity cascade;
truncate table support_tickets restart identity cascade;
truncate table support_knowledge_articles restart identity cascade;
truncate table mentorship_mentees restart identity cascade;
truncate table mentorship_logs restart identity cascade;
truncate table admin_incubatees restart identity cascade;
truncate table faculty_directory restart identity cascade;
truncate table system_templates restart identity cascade;
truncate table notification_state restart identity cascade;
truncate table notification_audience restart identity cascade;
truncate table notifications restart identity cascade;
truncate table email_delivery_log restart identity cascade;
truncate table incubatee_profiles restart identity cascade;
truncate table users restart identity cascade;
