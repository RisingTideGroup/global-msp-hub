import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text, replyTo }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const fromEmail = Deno.env.get('MAILGUN_FROM_EMAIL');

    if (!mailgunApiKey || !mailgunDomain || !fromEmail) {
      throw new Error('Mailgun configuration missing');
    }

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('from', fromEmail);
    
    if (Array.isArray(to)) {
      to.forEach(email => formData.append('to', email));
    } else {
      formData.append('to', to);
    }
    
    formData.append('subject', subject);
    formData.append('html', html);
    
    if (text) {
      formData.append('text', text);
    }
    
    if (replyTo) {
      formData.append('h:Reply-To', replyTo);
    }

    // Send via Mailgun
    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Mailgun error:', result);
      throw new Error(result.message || 'Failed to send email');
    }

    console.log('Email sent successfully:', result);

    // Log to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from('notification_logs').insert({
      notification_type_key: 'generic_email',
      recipient_email: Array.isArray(to) ? to[0] : to,
      subject,
      status: 'sent',
      metadata: { mailgun_id: result.id }
    });

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
