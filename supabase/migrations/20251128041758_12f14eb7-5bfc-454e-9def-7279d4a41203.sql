-- Create business subscriptions table
CREATE TABLE public.business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Enable RLS
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.business_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.business_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.business_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Business owners can view who subscribed to their business
CREATE POLICY "Business owners can view their subscribers"
  ON public.business_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_subscriptions.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.business_subscriptions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add notification type for new job posts
INSERT INTO public.notification_types (key, name, description, category, default_enabled, is_system)
VALUES (
  'company_new_job',
  'New Job from Subscribed Company',
  'Receive notifications when a company you follow posts a new job',
  'applicant',
  true,
  false
);

-- Add notification template
INSERT INTO public.notification_templates (
  notification_type_id,
  template_type,
  subject,
  body_html,
  body_text,
  variables
)
SELECT 
  id,
  'system_default',
  '{{company_name}} posted a new job: {{job_title}}',
  '<h2>New Job Alert!</h2>
<p>{{company_name}} just posted a new job that might interest you:</p>
<h3>{{job_title}}</h3>
<p><strong>Location:</strong> {{job_location}}</p>
<p><strong>Type:</strong> {{job_type}}</p>
<p>{{job_description}}</p>
<p><a href="{{job_url}}" style="display: inline-block; padding: 12px 24px; background-color: #007ac1; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">View Job Details</a></p>',
  '{{company_name}} posted a new job: {{job_title}}

Location: {{job_location}}
Type: {{job_type}}

{{job_description}}

View job: {{job_url}}',
  '["company_name", "job_title", "job_location", "job_type", "job_description", "job_url"]'::jsonb
FROM public.notification_types
WHERE key = 'company_new_job';

-- Create index for better query performance
CREATE INDEX idx_business_subscriptions_user_id ON public.business_subscriptions(user_id);
CREATE INDEX idx_business_subscriptions_business_id ON public.business_subscriptions(business_id);