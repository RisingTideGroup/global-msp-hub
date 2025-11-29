-- Create notification_types table
CREATE TABLE notification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('business', 'applicant', 'admin', 'system')),
  default_enabled BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notification_templates table
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type_id UUID REFERENCES notification_types(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('system_default', 'admin_global')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_type_id, template_type)
);

-- Create user_notification_preferences table
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type_id UUID REFERENCES notification_types(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  custom_template_subject TEXT,
  custom_template_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type_id)
);

-- Create notification_logs table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type_key TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_types
CREATE POLICY "Anyone can view notification types"
  ON notification_types FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage notification types"
  ON notification_types FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for notification_templates
CREATE POLICY "Admins can view all templates"
  ON notification_templates FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage templates"
  ON notification_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_notification_preferences
CREATE POLICY "Users can view own preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON user_notification_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences"
  ON user_notification_preferences FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for notification_logs
CREATE POLICY "Admins can view all logs"
  ON notification_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own notification logs"
  ON notification_logs FOR SELECT
  USING (auth.uid() = recipient_user_id);

-- Insert notification types
INSERT INTO notification_types (key, name, description, category, default_enabled, is_system) VALUES
  ('new_application', 'New Job Application', 'Sent to business owners when someone applies to their job', 'business', true, false),
  ('application_accepted', 'Application Accepted', 'Sent when your application is accepted', 'applicant', true, false),
  ('application_rejected', 'Application Rejected', 'Sent when your application is rejected', 'applicant', true, false),
  ('application_reviewed', 'Application Under Review', 'Sent when your application is being reviewed', 'applicant', true, false),
  ('business_approved', 'Business Approved', 'Sent when your business profile is approved', 'business', true, true),
  ('business_rejected', 'Business Rejected', 'Sent when your business profile is rejected', 'business', true, true),
  ('new_job_posted', 'New Job Posted', 'Sent to admins when a new job is posted', 'admin', true, false),
  ('new_business_registered', 'New Business Registered', 'Sent to admins when a new business registers', 'admin', true, false);

-- Insert system default templates
INSERT INTO notification_templates (notification_type_id, template_type, subject, body_html, body_text, variables) VALUES
  -- new_application
  (
    (SELECT id FROM notification_types WHERE key = 'new_application'),
    'system_default',
    'New Application for {{job_title}}',
    '<h2>New Job Application</h2><p>Hi there,</p><p><strong>{{applicant_name}}</strong> ({{applicant_email}}) has submitted an application for the <strong>{{job_title}}</strong> position at {{business_name}}.</p><p><a href="{{dashboard_link}}">View Application in Dashboard</a></p><p>Application received on {{applied_date}}.</p>',
    'Hi there,\n\n{{applicant_name}} ({{applicant_email}}) has submitted an application for the {{job_title}} position at {{business_name}}.\n\nView the application in your dashboard: {{dashboard_link}}\n\nApplication received on {{applied_date}}.',
    '["applicant_name", "applicant_email", "job_title", "business_name", "dashboard_link", "applied_date"]'::jsonb
  ),
  -- application_accepted
  (
    (SELECT id FROM notification_types WHERE key = 'application_accepted'),
    'system_default',
    'Congratulations! Your Application for {{job_title}} at {{business_name}} Was Accepted',
    '<h2>Application Accepted!</h2><p>Hi {{applicant_name}},</p><p>Great news! Your application for the <strong>{{job_title}}</strong> position at <strong>{{business_name}}</strong> has been accepted.</p><p>The employer will be in touch with you soon regarding next steps.</p><p><a href="{{job_link}}">View Job Posting</a></p><p>Best of luck!</p>',
    'Hi {{applicant_name}},\n\nGreat news! Your application for the {{job_title}} position at {{business_name}} has been accepted.\n\nThe employer will be in touch with you soon regarding next steps.\n\nView job posting: {{job_link}}\n\nBest of luck!',
    '["applicant_name", "job_title", "business_name", "job_link"]'::jsonb
  ),
  -- application_rejected
  (
    (SELECT id FROM notification_types WHERE key = 'application_rejected'),
    'system_default',
    'Update on Your Application for {{job_title}} at {{business_name}}',
    '<h2>Application Update</h2><p>Hi {{applicant_name}},</p><p>Thank you for your interest in the <strong>{{job_title}}</strong> position at <strong>{{business_name}}</strong>.</p><p>After careful consideration, we have decided to move forward with other candidates at this time.</p><p>We appreciate the time you invested in your application and encourage you to apply for future opportunities that match your skills and experience.</p><p><a href="{{job_link}}">View Job Posting</a></p><p>Best regards</p>',
    'Hi {{applicant_name}},\n\nThank you for your interest in the {{job_title}} position at {{business_name}}.\n\nAfter careful consideration, we have decided to move forward with other candidates at this time.\n\nWe appreciate the time you invested in your application and encourage you to apply for future opportunities that match your skills and experience.\n\nView job posting: {{job_link}}\n\nBest regards',
    '["applicant_name", "job_title", "business_name", "job_link"]'::jsonb
  ),
  -- application_reviewed
  (
    (SELECT id FROM notification_types WHERE key = 'application_reviewed'),
    'system_default',
    'Your Application for {{job_title}} at {{business_name}} Is Being Reviewed',
    '<h2>Application Under Review</h2><p>Hi {{applicant_name}},</p><p>Your application for the <strong>{{job_title}}</strong> position at <strong>{{business_name}}</strong> is currently being reviewed.</p><p>We will update you on the status of your application soon.</p><p><a href="{{job_link}}">View Job Posting</a></p><p>Thank you for your patience!</p>',
    'Hi {{applicant_name}},\n\nYour application for the {{job_title}} position at {{business_name}} is currently being reviewed.\n\nWe will update you on the status of your application soon.\n\nView job posting: {{job_link}}\n\nThank you for your patience!',
    '["applicant_name", "job_title", "business_name", "job_link"]'::jsonb
  ),
  -- business_approved
  (
    (SELECT id FROM notification_types WHERE key = 'business_approved'),
    'system_default',
    '🎉 Your Business Profile Has Been Approved!',
    '<h2>Business Approved!</h2><p>Hi {{owner_name}},</p><p>Great news! Your business profile for <strong>{{business_name}}</strong> has been approved and is now live on our platform.</p><p>You can now start posting jobs and connecting with potential candidates.</p><p><a href="{{dashboard_link}}">Go to Your Dashboard</a></p><p>Welcome aboard!</p>',
    'Hi {{owner_name}},\n\nGreat news! Your business profile for {{business_name}} has been approved and is now live on our platform.\n\nYou can now start posting jobs and connecting with potential candidates.\n\nGo to your dashboard: {{dashboard_link}}\n\nWelcome aboard!',
    '["owner_name", "business_name", "dashboard_link"]'::jsonb
  ),
  -- business_rejected
  (
    (SELECT id FROM notification_types WHERE key = 'business_rejected'),
    'system_default',
    'Update on Your Business Profile Submission',
    '<h2>Business Profile Status</h2><p>Hi {{owner_name}},</p><p>Thank you for submitting your business profile for <strong>{{business_name}}</strong>.</p><p>Unfortunately, we are unable to approve your profile at this time. This may be due to incomplete information or other verification requirements.</p><p>Please review your profile and resubmit with any necessary updates, or contact our support team for assistance.</p><p><a href="{{dashboard_link}}">Edit Your Profile</a></p>',
    'Hi {{owner_name}},\n\nThank you for submitting your business profile for {{business_name}}.\n\nUnfortunately, we are unable to approve your profile at this time. This may be due to incomplete information or other verification requirements.\n\nPlease review your profile and resubmit with any necessary updates, or contact our support team for assistance.\n\nEdit your profile: {{dashboard_link}}',
    '["owner_name", "business_name", "dashboard_link"]'::jsonb
  ),
  -- new_job_posted
  (
    (SELECT id FROM notification_types WHERE key = 'new_job_posted'),
    'system_default',
    '[Admin] New Job Posted: {{job_title}} at {{business_name}}',
    '<h2>New Job Posted</h2><p>A new job has been posted on the platform:</p><ul><li><strong>Job Title:</strong> {{job_title}}</li><li><strong>Business:</strong> {{business_name}}</li><li><strong>Location:</strong> {{location}}</li></ul><p><a href="{{job_link}}">View Job</a></p>',
    'A new job has been posted on the platform:\n\nJob Title: {{job_title}}\nBusiness: {{business_name}}\nLocation: {{location}}\n\nView job: {{job_link}}',
    '["job_title", "business_name", "location", "job_link"]'::jsonb
  ),
  -- new_business_registered
  (
    (SELECT id FROM notification_types WHERE key = 'new_business_registered'),
    'system_default',
    '[Admin] New Business Registration: {{business_name}}',
    '<h2>New Business Registered</h2><p>A new business has registered on the platform:</p><ul><li><strong>Business Name:</strong> {{business_name}}</li><li><strong>Owner:</strong> {{owner_name}}</li><li><strong>Industry:</strong> {{industry}}</li></ul><p><a href="{{admin_link}}">Review in Admin Panel</a></p>',
    'A new business has registered on the platform:\n\nBusiness Name: {{business_name}}\nOwner: {{owner_name}}\nIndustry: {{industry}}\n\nReview in admin panel: {{admin_link}}',
    '["business_name", "owner_name", "industry", "admin_link"]'::jsonb
  );

-- Add updated_at trigger
CREATE TRIGGER update_notification_types_updated_at
  BEFORE UPDATE ON notification_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_notification_types_key ON notification_types(key);
CREATE INDEX idx_notification_types_category ON notification_types(category);
CREATE INDEX idx_notification_templates_type_id ON notification_templates(notification_type_id);
CREATE INDEX idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_notification_logs_recipient_user_id ON notification_logs(recipient_user_id);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);