import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  notificationType: string;
  recipientUserId?: string;
  recipientEmail?: string;
  context: Record<string, any>;
}

function renderTemplate(template: string, context: Record<string, any>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  }
  return rendered;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notificationType, recipientUserId, recipientEmail, context }: NotificationRequest = await req.json();

    if (!notificationType || (!recipientUserId && !recipientEmail)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch notification type
    const { data: notifType, error: notifTypeError } = await supabase
      .from('notification_types')
      .select('*')
      .eq('key', notificationType)
      .single();

    if (notifTypeError || !notifType) {
      console.error('Notification type not found:', notificationType);
      return new Response(
        JSON.stringify({ error: 'Notification type not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user preferences if user ID is provided
    if (recipientUserId && !notifType.is_system) {
      const { data: preference } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', recipientUserId)
        .eq('notification_type_id', notifType.id)
        .single();

      // If preference exists and is disabled, skip
      if (preference && !preference.is_enabled) {
        console.log('Notification disabled by user preference');
        
        await supabase.from('notification_logs').insert({
          notification_type_key: notificationType,
          recipient_email: recipientEmail || 'unknown',
          recipient_user_id: recipientUserId,
          subject: 'N/A',
          status: 'skipped',
          metadata: { reason: 'user_preference_disabled' }
        });

        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: 'user_preference_disabled' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch template (priority: admin global > system default)
    const { data: templates } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('notification_type_id', notifType.id)
      .eq('is_active', true)
      .order('template_type', { ascending: false }); // admin_global comes before system_default

    if (!templates || templates.length === 0) {
      throw new Error('No template found for notification type');
    }

    const template = templates[0]; // Use the first one (admin_global if exists, otherwise system_default)

    // Render template
    const subject = renderTemplate(template.subject, context);
    const bodyHtml = renderTemplate(template.body_html, context);
    const bodyText = template.body_text ? renderTemplate(template.body_text, context) : undefined;

    // Get recipient email if not provided
    let finalRecipientEmail = recipientEmail;
    if (!finalRecipientEmail && recipientUserId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', recipientUserId)
        .single();

      finalRecipientEmail = profile?.email;
    }

    if (!finalRecipientEmail) {
      throw new Error('Could not determine recipient email');
    }

    // Send email via send-email function
    const emailResponse = await supabase.functions.invoke('send-email', {
      body: {
        to: finalRecipientEmail,
        subject,
        html: bodyHtml,
        text: bodyText
      }
    });

    if (emailResponse.error) {
      throw emailResponse.error;
    }

    // Log notification
    await supabase.from('notification_logs').insert({
      notification_type_key: notificationType,
      recipient_email: finalRecipientEmail,
      recipient_user_id: recipientUserId,
      subject,
      status: 'sent',
      metadata: context
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
